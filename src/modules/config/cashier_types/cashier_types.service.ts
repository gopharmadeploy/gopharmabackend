import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCashierTypeDto } from './dto/create-cashier-types.dto';
import { UpdateCashierTypeDto } from './dto/update-cashier-types.dto';
import { CashierType } from './entities/cashier_type.entity';
import { Like, Raw, Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class CashierTypesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(CashierType) private cashierTypesRepository: Repository<CashierType>,
    ) {}

    async create(
        createCashierTypeDto: CreateCashierTypeDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newCashierType = {
            ...createCashierTypeDto,
            type: createCashierTypeDto.type.toUpperCase(),
            user: user,
            userUpdate: user,
        };

        try {
            await this.cashierTypesRepository.save(newCashierType);
            return '¡Tipo de caja creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: CashierType[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            user: true,
            userUpdate: true,
        };

        let dateRange: any;

        if (query.updatedAt) {
            const dates = query.updatedAt.split(',');
            if (dates.length === 2) {
                dateRange = Between(new Date(dates[0]), new Date(dates[1]));
            }
        } else if (query.createdAt) {
            const dates = query.createdAt.split(',');
            if (dates.length === 2) {
                dateRange = Between(new Date(dates[0]), new Date(dates[1]));
            }
        }

        const where = {
            id: Raw((id) => `CAST(${id} as char) Like '%${query.id || ''}%'`),
            type: Like(`%${query.type || ''}%`),
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.cashierTypesRepository.count({ where }),
                query?.export
                    ? this.cashierTypesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.cashierTypesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                          take,
                          skip,
                      }),
            ]);

            return {
                totalRows: resCount,
                data: resData,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Error fetching sub categories',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<CashierType> {
        return await this.cashierTypesRepository.findOne({ where: { id } });
    }

    async update(
        id: number,
        updateCashierTypeDto: UpdateCashierTypeDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);
        const printer = await this.cashierTypesRepository.findOneBy({ id });

        const updateCashierType = {
            ...printer,
            ...updateCashierTypeDto,
            type: updateCashierTypeDto.type.toUpperCase(),
            userUpdate: user,
        };

        try {
            await this.cashierTypesRepository.save(updateCashierType);
            return '¡Tipo de caja editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateCashierType = await this.cashierTypesRepository.findOneBy({ id });
        updateCashierType.isActive = !updateCashierType.isActive;

        try {
            await this.cashierTypesRepository.save(updateCashierType);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listCashierTypes(): Promise<CashierType[]> {
        return await this.cashierTypesRepository.find({ where: { isActive: true } });
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [{ header: 'Tipo de caja', key: 'type', width: 20 }];
        // Aplicar estilos a la cabecera
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '2a953d' },
        };
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        // Agregar datos y aplicar estilos
        data.forEach((item) => {
            const row = worksheet.addRow(item);

            row.alignment = { vertical: 'middle', horizontal: 'left' };
            row.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        // Configurar el encabezado de la respuesta HTTP
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', `attachment; filename=data.xlsx`);

        // Escribir el libro de trabajo en la respuesta HTTP
        await workbook.xlsx.write(res);
        res.end();
    }
}

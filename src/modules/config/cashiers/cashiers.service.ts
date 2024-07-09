import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCashierDto } from './dto/create-cashiers.dto';
import { UpdateCashierDto } from './dto/update-cashiers.dto';
import { Cashier } from './entities/cashier.entity';
import { Like, Raw, Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class CashiersService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(Cashier) private cashiersRepository: Repository<Cashier>,
    ) {}

    async create(createCashierDto: CreateCashierDto, userId: number): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newCashier = {
            ...createCashierDto,
            name: createCashierDto.name.toUpperCase(),
            user: user,
            userUpdate: user,
        };

        try {
            await this.cashiersRepository.save(newCashier);
            return '¡Caja creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Cashier[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            cashierType: true,
            printer: true,
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
            name: Like(`%${query.name || ''}%`),
            cashierType: query.cashierType && {
                type: Like(`%${query.cashierType || ''}%`),
            },
            printer: query.printer && {
                serialNumber: Like(`%${query.printer || ''}%`),
            },
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.cashiersRepository.count({ where }),
                query?.export
                    ? this.cashiersRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.cashiersRepository.find({
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

    async findOne(id: number): Promise<Cashier> {
        const relations = {
            cashierType: true,
            printer: true,
        };

        return await this.cashiersRepository.findOne({ where: { id }, relations });
    }

    async update(
        id: number,
        updateCashierDto: UpdateCashierDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);
        const printer = await this.cashiersRepository.findOneBy({ id });

        const updateCashier = {
            ...printer,
            ...updateCashierDto,
            name: updateCashierDto.name.toUpperCase(),
            userUpdate: user,
        };

        try {
            await this.cashiersRepository.save(updateCashier);
            return '¡Caja editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateCashier = await this.cashiersRepository.findOneBy({ id });
        updateCashier.isActive = !updateCashier.isActive;

        try {
            await this.cashiersRepository.save(updateCashier);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listCashiers(): Promise<Cashier[]> {
        return await this.cashiersRepository.find({ where: { isActive: true } });
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Nombre', key: 'name', width: 20 },
            { header: 'Dirección IP', key: 'ipAddress', width: 20 },
            { header: 'MAC', key: 'mac', width: 20 },
        ];
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

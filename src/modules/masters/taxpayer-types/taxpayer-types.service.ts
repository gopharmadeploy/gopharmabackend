import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaxpayerTypeDto } from './dto/create-taxpayer-type.dto';
import { UpdateTaxpayerTypeDto } from './dto/update-taxpayer-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaxpayerType } from './entities/taxpayer-type.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class TaxpayerTypesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(TaxpayerType) private taxpayerTypesRepository: Repository<TaxpayerType>,
    ) {}

    async create(createTaxpayerTypeDto: CreateTaxpayerTypeDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);

        const newTaxpayerType = {
            ...createTaxpayerTypeDto,
            user: user,
            userUpdate: user,
        };

        try {
            await this.taxpayerTypesRepository.save(newTaxpayerType);
            return 'TaxpayerType created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException('Error creating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: TaxpayerType[] }> {
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
            name: Like(`%${query.name || ''}%`),
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };
        try {
            const [resCount, resData] = await Promise.all([
                this.taxpayerTypesRepository.count({ where }),
                query?.export
                    ? this.taxpayerTypesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.taxpayerTypesRepository.find({
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

    async findOne(id: number): Promise<TaxpayerType> {
        const taxpayerType = await this.taxpayerTypesRepository.findOne({ where: { id } });
        if (!taxpayerType) throw new HttpException('TaxpayerType not found', HttpStatus.NOT_FOUND);
        return taxpayerType;
    }

    async update(id: number, updateTaxpayerTypeDto: UpdateTaxpayerTypeDto) {
        const brand = await this.findOne(id);
        if (!brand) throw new HttpException('TaxpayerType not found', HttpStatus.NOT_FOUND);

        Object.assign(brand, updateTaxpayerTypeDto);

        try {
            await this.taxpayerTypesRepository.save(brand);
            return `TaxpayerType #${id} updated successfully`;
        } catch (error) {
            throw new HttpException('Error updating brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: number) {
        const taxpayerType = await this.findOne(id);
        if (!taxpayerType) throw new HttpException('TaxpayerType not found', HttpStatus.NOT_FOUND);

        try {
            await this.taxpayerTypesRepository.remove(taxpayerType);
            return `TaxpayerType #${id} removed successfully`;
        } catch (error) {
            throw new HttpException('Error removing brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateTaxpayerType = await this.taxpayerTypesRepository.findOneBy({ id });
        updateTaxpayerType.isActive = !updateTaxpayerType.isActive;

        try {
            await this.taxpayerTypesRepository.save(updateTaxpayerType);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listTaxpayerTypes(): Promise<TaxpayerType[]> {
        return await this.taxpayerTypesRepository.find({ where: { isActive: true } });
    }

    async getAllBanks(): Promise<TaxpayerType[]> {
        return this.taxpayerTypesRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [{ header: 'Tipo de contribuyente', key: 'name', width: 20 }];
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

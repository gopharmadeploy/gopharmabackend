import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePrinterTypeDto } from './dto/create-printer-types.dto';
import { UpdatePrinterTypeDto } from './dto/update-printer-types.dto';
import { PrinterType } from './entities/printer_type.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class PrinterTypesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(PrinterType) private printerTypesRepository: Repository<PrinterType>,
    ) {}

    async create(
        createPrinterTypeDto: CreatePrinterTypeDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newPrinterType = new PrinterType();
        newPrinterType.type = createPrinterTypeDto.type.toUpperCase();
        newPrinterType.user = user;
        newPrinterType.userUpdate = user;

        try {
            await this.printerTypesRepository.save(newPrinterType);
            return '¡Tipo de impresora creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: PrinterType[] }> {
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
                this.printerTypesRepository.count({ where }),
                query?.export
                    ? this.printerTypesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.printerTypesRepository.find({
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

    async findOne(id: number): Promise<PrinterType> {
        return await this.printerTypesRepository.findOneBy({ id });
    }

    async update(
        id: number,
        updatePrinterTypeDto: UpdatePrinterTypeDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const updatePrinterType = await this.printerTypesRepository.findOneBy({ id });
        updatePrinterType.type = updatePrinterTypeDto.type.toUpperCase();
        updatePrinterType.userUpdate = user;

        try {
            await this.printerTypesRepository.save(updatePrinterType);
            return '¡Tipo de impresora editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updatePrinterType = await this.printerTypesRepository.findOneBy({ id });
        updatePrinterType.isActive = !updatePrinterType.isActive;

        try {
            await this.printerTypesRepository.save(updatePrinterType);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listPrinterTypes(): Promise<PrinterType[]> {
        return await this.printerTypesRepository.find({ where: { isActive: true } });
    }

    async getAllBanks(): Promise<PrinterType[]> {
        return this.printerTypesRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [{ header: 'Tipo', key: 'type', width: 20 }];
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePrinterDto } from './dto/create-printers.dto';
import { UpdatePrinterDto } from './dto/update-printers.dto';
import { Printer } from './entities/printer.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class PrintersService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(Printer) private printersRepository: Repository<Printer>,
    ) {}

    async create(createPrinterDto: CreatePrinterDto, userId: number): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newPrinter = {
            ...createPrinterDto,
            user: user,
            userUpdate: user,
        };

        try {
            await this.printersRepository.save(newPrinter);
            return '¡Impresora creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Printer[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            printerModel: {
                printerBrand: true,
            },
            printerType: true,
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
            serialNumber: Like(`%${query.serialNumber || ''}%`),
            printerModel: query.printerModel && {
                model: Like(`%${query.printerModel || ''}%`),
            },
            printerType: query.printerType && {
                type: Like(`%${query.printerType || ''}%`),
            },
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.printersRepository.count({ where }),
                query?.export
                    ? this.printersRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.printersRepository.find({
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

    async findOne(id: number): Promise<Printer> {
        const relations = {
            printerModel: {
                printerBrand: true,
            },
            printerType: true,
        };

        return await this.printersRepository.findOne({ where: { id }, relations });
    }

    async update(
        id: number,
        updatePrinterDto: UpdatePrinterDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);
        const printer = await this.printersRepository.findOneBy({ id });

        const updatePrinter = {
            ...printer,
            ...updatePrinterDto,
            userUpdate: user,
        };

        try {
            await this.printersRepository.save(updatePrinter);
            return '¡Impresora editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updatePrinter = await this.printersRepository.findOneBy({ id });
        updatePrinter.isActive = !updatePrinter.isActive;

        try {
            await this.printersRepository.save(updatePrinter);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listPrinters(): Promise<Printer[]> {
        return await this.printersRepository.find({ where: { isActive: true } });
    }

    async getAllBanks(): Promise<Printer[]> {
        return this.printersRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Numero de serie', key: 'serialNumber', width: 20 },
            { header: 'Dirección IP', key: 'ipAddress', width: 20 },
            { header: 'Puerto', key: 'port', width: 20 },
            { header: 'MAC', key: 'mac', width: 20 },
            { header: 'Usuario ', key: 'conectionUser', width: 20 },
            { header: 'Fecha de instalación', key: 'instalationDate', width: 20 },
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

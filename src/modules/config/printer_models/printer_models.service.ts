import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePrinterModelDto } from './dto/create-printer-models.dto';
import { UpdatePrinterModelDto } from './dto/update-printer-models.dto';
import { PrinterModel } from './entities/printer_model.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class PrinterModelsService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(PrinterModel) private printerModelsRepository: Repository<PrinterModel>,
    ) {}

    async create(
        createPrinterModelDto: CreatePrinterModelDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newPrinterModel = new PrinterModel();
        newPrinterModel.model = createPrinterModelDto.model.toUpperCase();
        newPrinterModel.printerBrand = createPrinterModelDto.printerBrand;
        newPrinterModel.user = user;
        newPrinterModel.userUpdate = user;

        try {
            await this.printerModelsRepository.save(newPrinterModel);
            return '¡Tipo de impresora creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: PrinterModel[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            printerBrand: true,
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
            model: Like(`%${query.model || ''}%`),
            printerBrand: query.printerBrand && {
                brand: Like(`%${query.printerBrand || ''}%`),
            },
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.printerModelsRepository.count({ where }),
                query?.export
                    ? this.printerModelsRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.printerModelsRepository.find({
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

    async findOne(id: number): Promise<PrinterModel> {
        const relations = {
            printerBrand: true,
        };

        return await this.printerModelsRepository.findOne({ where: { id }, relations });
    }

    async update(
        id: number,
        updatePrinterModelDto: UpdatePrinterModelDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const updatePrinterModel = await this.printerModelsRepository.findOneBy({ id });
        updatePrinterModel.model = updatePrinterModelDto.model.toUpperCase();
        updatePrinterModel.printerBrand = updatePrinterModelDto.printerBrand;
        updatePrinterModel.userUpdate = user;

        try {
            await this.printerModelsRepository.save(updatePrinterModel);
            return '¡Tipo de impresora editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updatePrinterModel = await this.printerModelsRepository.findOneBy({ id });
        updatePrinterModel.isActive = !updatePrinterModel.isActive;

        try {
            await this.printerModelsRepository.save(updatePrinterModel);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listPrinterModels(query: any): Promise<PrinterModel[]> {
        const options: any = {
            where: { isActive: true },
        };

        if (query.printerBrandId) {
            options.relations = {
                printerBrand: true,
            };
            options.where.printerBrand = { id: +query.printerBrandId };
        }

        return await this.printerModelsRepository.find(options);
    }

    async getAllBanks(): Promise<PrinterModel[]> {
        return this.printerModelsRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [{ header: 'Modelo', key: 'model', width: 20 }];
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

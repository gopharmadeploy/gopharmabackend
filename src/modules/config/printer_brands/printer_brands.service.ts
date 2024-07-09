import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePrinterBrandDto } from './dto/create-printer-brands.dto';
import { UpdatePrinterBrandDto } from './dto/update-printer-brands.dto';
import { PrinterBrand } from './entities/printer_brand.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class PrinterBrandsService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(PrinterBrand) private printerBrandsRepository: Repository<PrinterBrand>,
    ) {}

    async create(
        createPrinterBrandDto: CreatePrinterBrandDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newPrinterBrand = new PrinterBrand();
        newPrinterBrand.brand = createPrinterBrandDto.brand.toUpperCase();
        newPrinterBrand.user = user;
        newPrinterBrand.userUpdate = user;

        try {
            await this.printerBrandsRepository.save(newPrinterBrand);
            return '¡Marca de impresora creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: PrinterBrand[] }> {
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
            brand: Like(`%${query.brand || ''}%`),
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.printerBrandsRepository.count({ where }),
                query?.export
                    ? this.printerBrandsRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.printerBrandsRepository.find({
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

    async findOne(id: number): Promise<PrinterBrand> {
        return await this.printerBrandsRepository.findOneBy({ id });
    }

    async update(
        id: number,
        updatePrinterBrandDto: UpdatePrinterBrandDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const updatePrinterBrand = await this.printerBrandsRepository.findOneBy({ id });
        updatePrinterBrand.brand = updatePrinterBrandDto.brand.toUpperCase();
        updatePrinterBrand.userUpdate = user;

        try {
            await this.printerBrandsRepository.save(updatePrinterBrand);
            return '¡Marca de impresora editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updatePrinterBrand = await this.printerBrandsRepository.findOneBy({ id });
        updatePrinterBrand.isActive = !updatePrinterBrand.isActive;

        try {
            await this.printerBrandsRepository.save(updatePrinterBrand);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listPrinterBrands(): Promise<PrinterBrand[]> {
        return await this.printerBrandsRepository.find({ where: { isActive: true } });
    }

    async getAllBanks(): Promise<PrinterBrand[]> {
        return this.printerBrandsRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [{ header: 'Marca', key: 'brand', width: 20 }];
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

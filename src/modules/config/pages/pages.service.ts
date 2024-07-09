import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page } from './entities/page.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class PagesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(Page) private pagesRepository: Repository<Page>,
    ) {}

    async create(createPageDto: CreatePageDto, userId: number): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newPage = new Page();
        newPage.name = createPageDto.name;
        newPage.icon = createPageDto.icon || null;
        newPage.route = createPageDto.route || null;
        newPage.packages = createPageDto.packages;
        newPage.pageFather = createPageDto?.pageFather || null;
        newPage.application = createPageDto.application;
        newPage.user = user;
        newPage.userUpdate = user;

        try {
            await this.pagesRepository.save(newPage);
            return '¡Página creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Page[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            application: true,
            pageFather: true,
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
            pageFather: query.pageFather && {
                name: Like(`%${query.pageFather || ''}%`),
            },
            application: query.application && {
                name: Like(`%${query.application || ''}%`),
            },
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.pagesRepository.count({ where }),
                query?.export
                    ? this.pagesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.pagesRepository.find({
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

    async findOne(id: number): Promise<Page> {
        const relations = {
            application: true,
            pageFather: true,
            user: true,
            userUpdate: true,
            packages: true,
        };

        return await this.pagesRepository.findOne({ where: { id }, relations });
    }

    async update(
        id: number,
        updatePageDto: UpdatePageDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const updatePage = await this.pagesRepository.findOneBy({ id });
        updatePage.name = updatePageDto.name;
        updatePage.icon = updatePageDto.icon || null;
        updatePage.route = updatePageDto.route || null;
        updatePage.packages = updatePageDto.packages;
        updatePage.pageFather = updatePageDto?.pageFather || null;
        updatePage.application = updatePageDto.application;
        updatePage.userUpdate = user;

        try {
            await this.pagesRepository.save(updatePage);
            return '¡Página editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updatePage = await this.pagesRepository.findOneBy({ id });
        updatePage.isActive = !updatePage.isActive;

        try {
            await this.pagesRepository.save(updatePage);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listPages(): Promise<Page[]> {
        return await this.pagesRepository.find({ where: { isActive: true } });
    }

    async getAllBanks(): Promise<Page[]> {
        return this.pagesRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Paginas', key: 'name', width: 20 },
            { header: 'Icono', key: 'icon', width: 20 },
            { header: 'Ruta', key: 'route', width: 20 },
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

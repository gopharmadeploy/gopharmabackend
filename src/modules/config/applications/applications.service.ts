import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { IsNull, Like, Raw, Repository, Between } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { Page } from '../pages/entities/page.entity';

@Injectable()
export class ApplicationsService {
    constructor(
        private usersService: UsersService,

        @InjectRepository(Application) private applicationsRepository: Repository<Application>,

        @InjectRepository(Page) private pagesRepository: Repository<Page>,
    ) {}

    async create(
        createApplicationDto: CreateApplicationDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newApplication = new Application();
        newApplication.name = createApplicationDto.name.toUpperCase();
        newApplication.user = user;
        newApplication.userUpdate = user;

        try {
            await this.applicationsRepository.save(newApplication);
            return '¡Aplicación creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Application[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            user: true,
            userUpdate: true,
            pages: true,
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
                this.applicationsRepository.count({ where }),
                query?.export
                    ? this.applicationsRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.applicationsRepository.find({
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

    async findOne(id: number): Promise<Application> {
        return await this.applicationsRepository.findOneBy({ id });
    }

    async update(
        id: number,
        updateApplicationDto: UpdateApplicationDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const updateApplication = await this.applicationsRepository.findOneBy({ id });
        updateApplication.name = updateApplicationDto.name.toUpperCase();
        updateApplication.userUpdate = user;

        try {
            await this.applicationsRepository.save(updateApplication);
            return '¡Aplicación editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateApplication = await this.applicationsRepository.findOneBy({ id });
        updateApplication.isActive = !updateApplication.isActive;

        try {
            await this.applicationsRepository.save(updateApplication);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listApplications(payload: any): Promise<Application[]> {
        let applications = await this.applicationsRepository.find({
            where: { isActive: true },
            relations: payload.query?.profileForm && {
                pages: {
                    packages: true,
                    pageFather: true,
                },
            },
        });

        if (payload.query?.profileForm) {
            applications = applications.map((app: any): any => {
                app.pages = app.pages.map((page: any) => {
                    page.check = false;
                    return page;
                });

                return app;
            });
        }

        return applications;
    }

    async findAllProfile() {
        const relations = {
            user: true,
            userUpdate: true,
            //pages: true,
        };

        const where = {
            isActive: true,
        };

        const resData = await this.applicationsRepository.find({
            relations,
            where,
        });

        const resdataMenuPromises = resData.map(async (dta) => {
            const modules = await this.getPagesByParentId(null, dta.id);
            return {
                ...dta,
                active: false,
                modules: modules,
            };
        });

        const resDataMenu2 = await Promise.all(resdataMenuPromises);

        return {
            data: resDataMenu2,
        };
    }

    async getPagesByParentId(parentId: number | null, applicationId: number) {
        const pages = await this.pagesRepository.find({
            where: {
                application: { id: applicationId },
                pageFather: parentId === null ? IsNull() : { id: parentId },
            },
            relations: ['pageFather', 'packages'],
        });

        const pagesWithChildrenPromises = pages.map(async (page) => {
            const children = await this.getPagesByParentId(page.id, applicationId);
            return {
                ...page,
                active: false,
                pages: children,
                package: 1,
            };
        });

        return await Promise.all(pagesWithChildrenPromises);
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [{ header: 'Aplicaciones', key: 'name', width: 20 }];
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

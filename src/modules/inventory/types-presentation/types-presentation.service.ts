import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTypesPresentationDto } from './dto/create-types-presentation.dto';
import { UpdateTypesPresentationDto } from './dto/update-types-presentation.dto';
import { TypesPresentation } from './entities/types-presentation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class TypesPresentationService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(TypesPresentation)
        private typesPresentationsRepository: Repository<TypesPresentation>,
    ) {}

    async create(
        createTypesPresentationDto: CreateTypesPresentationDto,
        userId: number,
    ): Promise<string> {
        const user = await this.usersService.findOne(userId);

        let maxId = await this.typesPresentationsRepository
            .createQueryBuilder('inventory_products_presentation_types')
            .select('MAX(inventory_products_presentation_types.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (parseInt(maxId) < 10) {
            maxId = `0${maxId}`;
        }

        const newTypePresentation = {
            ...createTypesPresentationDto,
            name: createTypesPresentationDto.name.toUpperCase(),
            code: maxId,
            user: user,
            userUpdate: user,
        };

        try {
            await this.typesPresentationsRepository.save(newTypePresentation);
            return 'Types of Presentation created successfully';
        } catch (error) {
            console.log(error);

            throw new HttpException(
                'Error creating Types of Presentation',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async listTypesPresentationService(): Promise<TypesPresentation[]> {
        return await this.typesPresentationsRepository.find({
            where: { isActive: true },
        });
    }

    async findAll(query: any): Promise<{ totalRows: number; data: TypesPresentation[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            user: true,
            userUpdate: true,
        };

        let updateAt;

        if (query.updateAt) {
            const dates = query.updateAt.split(',');
            if (dates.length === 2) {
                updateAt = Between(new Date(dates[0]), new Date(dates[1]));
            }
        }

        let createdAt;

        if (query.createdAt) {
            const dates = query.createdAt.split(',');
            if (dates.length === 2) {
                createdAt = Between(new Date(dates[0]), new Date(dates[1]));
            }
        }

        const where = {
            id: Raw((id) => `CAST(${id} as char) Like '%${query.id || ''}%'`),
            name: Like(`%${query.name || ''}%`),
            code: Like(`%${query.code || ''}%`),
            isActive: query.isActive != '' ? query.isActive : undefined,
            createdAt: createdAt || undefined,
            updateAt: updateAt || undefined, // Add the date range filte
        };
        try {
            const [resCount, resData] = await Promise.all([
                this.typesPresentationsRepository.count({ relations, where }),
                query?.export
                    ? this.typesPresentationsRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.typesPresentationsRepository.find({
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
            throw new HttpException(
                'Error fetching Types of Presentation',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<TypesPresentation> {
        const brand = await this.typesPresentationsRepository.findOne({ where: { id } });
        if (!brand) {
            throw new HttpException('Types of Presentation not found', HttpStatus.NOT_FOUND);
        }
        return brand;
    }

    async update(id: number, updateTypesPresentationDto: UpdateTypesPresentationDto) {
        const typePresenattion = await this.findOne(id);
        if (!typePresenattion) {
            throw new HttpException('Type of Presentation not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(typePresenattion, updateTypesPresentationDto);

        try {
            await this.typesPresentationsRepository.save(typePresenattion);
            return `Type of Presentation #${id} updated successfully`;
        } catch (error) {
            throw new HttpException(
                'Error updating Types of Presentation',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateTypePresentation = await this.typesPresentationsRepository.findOneBy({ id });
        updateTypePresentation.isActive = !updateTypePresentation.isActive;

        try {
            await this.typesPresentationsRepository.save(updateTypePresentation);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async getAllBanks(): Promise<TypesPresentation[]> {
        return this.typesPresentationsRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Codígo', key: 'code', width: 20 },

            { header: 'Tipo de presentación', key: 'name', width: 20 },
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

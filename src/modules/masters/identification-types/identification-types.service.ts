import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIdentificationTypeDto } from './dto/create-identification-type.dto';
import { UpdateIdentificationTypeDto } from './dto/update-identification-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IdentificationType } from './entities/identification-type.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class IdentificationTypesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(IdentificationType)
        private identificationTypesRepository: Repository<IdentificationType>,
    ) {}

    async create(
        createIdentificationTypeDto: CreateIdentificationTypeDto,
        userId: number,
    ): Promise<string> {
        const user = await this.usersService.findOne(userId);

        const newIdentificationType = {
            ...createIdentificationTypeDto,
            user: user,
            userUpdate: user,
        };

        try {
            await this.identificationTypesRepository.save(newIdentificationType);
            return 'IdentificationType created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException('Error creating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: IdentificationType[] }> {
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
            code: Like(`%${query.code || ''}%`),
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.identificationTypesRepository.count({ where }),
                query?.export
                    ? this.identificationTypesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.identificationTypesRepository.find({
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

    async findOne(id: number): Promise<IdentificationType> {
        const identificationType = await this.identificationTypesRepository.findOne({
            where: { id },
        });
        if (!identificationType)
            throw new HttpException('IdentificationType not found', HttpStatus.NOT_FOUND);
        return identificationType;
    }

    async update(id: number, updateIdentificationTypeDto: UpdateIdentificationTypeDto) {
        const identificationType = await this.findOne(id);
        if (!identificationType)
            throw new HttpException('IdentificationType not found', HttpStatus.NOT_FOUND);

        Object.assign(identificationType, updateIdentificationTypeDto);

        try {
            await this.identificationTypesRepository.save(identificationType);
            return `IdentificationType #${id} updated successfully`;
        } catch (error) {
            throw new HttpException(
                'Error updating identificationType',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async remove(id: number) {
        const identificationType = await this.findOne(id);
        if (!identificationType)
            throw new HttpException('IdentificationType not found', HttpStatus.NOT_FOUND);

        try {
            await this.identificationTypesRepository.remove(identificationType);
            return `IdentificationType #${id} removed successfully`;
        } catch (error) {
            throw new HttpException(
                'Error removing identificationType',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateIdentificationType = await this.identificationTypesRepository.findOneBy({ id });
        updateIdentificationType.isActive = !updateIdentificationType.isActive;

        try {
            await this.identificationTypesRepository.save(updateIdentificationType);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listIdentificationTypes(): Promise<IdentificationType[]> {
        return await this.identificationTypesRepository.find({ where: { isActive: true } });
    }

    async getAllBanks(): Promise<IdentificationType[]> {
        return this.identificationTypesRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Tipo de documento', key: 'name', width: 20 },
            { header: 'Codigo', key: 'code', width: 20 },
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTypesPackagingDto } from './dto/create-types-packaging.dto';
import { UpdateTypesPackagingDto } from './dto/update-types-packaging.dto';
import { TypesPackaging } from './entities/types-packaging.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class TypesPackagingService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(TypesPackaging)
        private typesPackagingRepository: Repository<TypesPackaging>,
    ) {}

    async create(
        createTypesPackagingDto: CreateTypesPackagingDto,
        userId: number,
    ): Promise<string> {
        const user = await this.usersService.findOne(userId);

        let maxId = await this.typesPackagingRepository
            .createQueryBuilder('inventory_products_packaging_types')
            .select('MAX(inventory_products_packaging_types.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (parseInt(maxId) < 10) {
            maxId = `0${maxId}`;
        }

        const newTypePresentation = {
            ...createTypesPackagingDto,
            name: createTypesPackagingDto.name.toUpperCase(),
            code: maxId,
            user: user,
            userUpdate: user,
        };

        try {
            await this.typesPackagingRepository.save(newTypePresentation);
            return 'type of  packaging created successfully';
        } catch (error) {
            console.log(error);

            throw new HttpException(
                'Error creating type of  packaging',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async listTypesPackaging(): Promise<TypesPackaging[]> {
        return await this.typesPackagingRepository.find({
            where: { isActive: true },
        });
    }

    async findAll(query: any): Promise<{ totalRows: number; data: TypesPackaging[] }> {
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
                this.typesPackagingRepository.count({ relations, where }),
                query?.export
                    ? this.typesPackagingRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.typesPackagingRepository.find({
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
                'Error fetching type of  packaging',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number) {
        const typesPackaging = await this.typesPackagingRepository.findOne({ where: { id } });
        if (!typesPackaging) {
            throw new HttpException('Type of  packaging not found', HttpStatus.NOT_FOUND);
        }
        return typesPackaging;
    }

    async update(id: number, updateTypesPackagingDto: UpdateTypesPackagingDto) {
        const typesPackaging = await this.findOne(id);
        if (!typesPackaging) {
            throw new HttpException('Type of  packaging not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(typesPackaging, updateTypesPackagingDto);

        try {
            await this.typesPackagingRepository.save(typesPackaging);
            return `Type of  packaging #${id} updated successfully`;
        } catch (error) {
            throw new HttpException(
                'Error updating Type of  packaging',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    remove(id: number) {
        return `This action removes a #${id} typesPackaging`;
    }

    async changeStatus(id: number): Promise<string | Error> {
        let typesPackaging = await this.typesPackagingRepository.findOneBy({ id });
        typesPackaging.isActive = !typesPackaging.isActive;

        try {
            await this.typesPackagingRepository.save(typesPackaging);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Codígo', key: 'code', width: 20 },
            { header: 'Tipo  de paquete', key: 'name', width: 20 },
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUnitsConcentrationDto } from './dto/create-units-concentration.dto';
import { UpdateUnitsConcentrationDto } from './dto/update-units-concentration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitsConcentration } from './entities/units-concentration.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class UnitsConcentrationService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(UnitsConcentration)
        private unitsConcentrationRepository: Repository<UnitsConcentration>,
    ) {}

    async create(
        createUnitsConcentrationDto: CreateUnitsConcentrationDto,
        userId: number,
    ): Promise<string> {
        const user = await this.usersService.findOne(userId);

        let maxId = await this.unitsConcentrationRepository
            .createQueryBuilder('inventory_products_units_concentration')
            .select('MAX(inventory_products_units_concentration.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (parseInt(maxId) < 10) {
            maxId = `0${maxId}`;
        }

        const newTypePresentation = {
            ...createUnitsConcentrationDto,
            name: createUnitsConcentrationDto.name.toUpperCase(),
            code: maxId,
            user: user,
            userUpdate: user,
        };

        try {
            await this.unitsConcentrationRepository.save(newTypePresentation);
            return 'Units concentration created successfully';
        } catch (error) {
            console.log(error);

            throw new HttpException(
                'Error creating units concentration',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async listUnistConcentration(): Promise<UnitsConcentration[]> {
        return await this.unitsConcentrationRepository.find({
            where: { isActive: true },
        });
    }

    async findAll(query: any): Promise<{ totalRows: number; data: UnitsConcentration[] }> {
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
                this.unitsConcentrationRepository.count({ relations, where }),
                query?.export
                    ? this.unitsConcentrationRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.unitsConcentrationRepository.find({
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
                'Error fetching Units concentration',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    async findOne(id: number): Promise<UnitsConcentration> {
        const unitsConcentration = await this.unitsConcentrationRepository.findOne({
            where: { id },
        });
        if (!unitsConcentration) {
            throw new HttpException('Units concentration not found', HttpStatus.NOT_FOUND);
        }
        return unitsConcentration;
    }

    async update(id: number, updateUnitsConcentrationDto: UpdateUnitsConcentrationDto) {
        const unitsConcentration = await this.findOne(id);
        if (!unitsConcentration) {
            throw new HttpException('Type of Presentation not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(unitsConcentration, updateUnitsConcentrationDto);

        try {
            await this.unitsConcentrationRepository.save(unitsConcentration);
            return `Units concentration #${id} updated successfully`;
        } catch (error) {
            throw new HttpException(
                'Error updating Units concentration',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    remove(id: number) {
        return `This action removes a #${id} unitsConcentration`;
    }

    async changeStatus(id: number): Promise<string | Error> {
        const unistConcentration = await this.unitsConcentrationRepository.findOneBy({ id });
        unistConcentration.isActive = !unistConcentration.isActive;

        try {
            await this.unitsConcentrationRepository.save(unistConcentration);
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
            { header: 'Unidades de concentación', key: 'name', width: 20 },
            { header: 'Usuario creador', key: 'user', width: 20 },
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
            const flattenedItem = {
                code: item.code,
                name: item.name,
                user: item.user ? item.user.name : '', // Asegurarse de obtener solo el nombre del usuario
            };

            const row = worksheet.addRow(flattenedItem);

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

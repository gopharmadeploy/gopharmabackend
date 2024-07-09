import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUnitsMeasurementDto } from './dto/create-units-measurement.dto';
import { UpdateUnitsMeasurementDto } from './dto/update-units-measurement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitsMeasurement } from './entities/units-measurement.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class UnitsMeasurementService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(UnitsMeasurement)
        private unitsMeasurementRepository: Repository<UnitsMeasurement>,
    ) {}

    async create(
        createUnitsMeasurementDto: CreateUnitsMeasurementDto,
        userId: number,
    ): Promise<string> {
        const user = await this.usersService.findOne(userId);

        let maxId = await this.unitsMeasurementRepository
            .createQueryBuilder('inventory_products_units_measurement')
            .select('MAX(inventory_products_units_measurement.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (parseInt(maxId) < 10) {
            maxId = `0${maxId}`;
        }

        const newTypePresentation = {
            ...createUnitsMeasurementDto,
            name: createUnitsMeasurementDto.name.toUpperCase(),
            code: maxId,
            user: user,
            userUpdate: user,
        };

        try {
            await this.unitsMeasurementRepository.save(newTypePresentation);
            return 'Units measurement created successfully';
        } catch (error) {
            console.log(error);

            throw new HttpException(
                'Error creating units measurement',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async listUnitsMeasurement(): Promise<UnitsMeasurement[]> {
        return await this.unitsMeasurementRepository.find({
            where: { isActive: true },
        });
    }

    async findAll(query: any): Promise<{ totalRows: number; data: UnitsMeasurement[] }> {
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
                this.unitsMeasurementRepository.count({ relations, where }),
                query?.export
                    ? this.unitsMeasurementRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.unitsMeasurementRepository.find({
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
                'Error fetching Units measurement',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<UnitsMeasurement> {
        const unitsMeasurement = await this.unitsMeasurementRepository.findOne({
            where: { id },
        });
        if (!unitsMeasurement) {
            throw new HttpException('Units Measurement not found', HttpStatus.NOT_FOUND);
        }
        return unitsMeasurement;
    }

    async update(id: number, updateUnitsMeasurementDto: UpdateUnitsMeasurementDto) {
        const unitsMeasurement = await this.findOne(id);
        if (!unitsMeasurement) {
            throw new HttpException('Type of Measurement not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(unitsMeasurement, updateUnitsMeasurementDto);

        try {
            await this.unitsMeasurementRepository.save(unitsMeasurement);
            return `Units Measurement #${id} updated successfully`;
        } catch (error) {
            throw new HttpException(
                'Error updating Units Measurement',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    remove(id: number) {
        return `This action removes a #${id} unitsMeasurement`;
    }

    async changeStatus(id: number): Promise<string | Error> {
        const unitsMeasurement = await this.unitsMeasurementRepository.findOneBy({ id });
        unitsMeasurement.isActive = !unitsMeasurement.isActive;

        try {
            await this.unitsMeasurementRepository.save(unitsMeasurement);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async getAllBanks(): Promise<UnitsMeasurement[]> {
        return this.unitsMeasurementRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.columns = [
            { header: 'Nombre:', key: 'name', width: 20 },
            { header: 'Código:', key: 'code', width: 20 },
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

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', `attachment; filename=data.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    }
}

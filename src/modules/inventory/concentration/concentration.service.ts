import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConcentrationDto } from './dto/create-concentration.dto';
import { UpdateConcentrationDto } from './dto/update-concentration.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitsConcentrationService } from '../units-concentration/units-concentration.service';
import { Concentration } from './entities/concentration.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class ConcentrationService {
    constructor(
        private usersService: UsersService,
        private unitsConcentrationService: UnitsConcentrationService,
        @InjectRepository(Concentration)
        private concentrationRepository: Repository<Concentration>,
    ) {}

    async create(createConcentrationDto: CreateConcentrationDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        let maxId = await this.concentrationRepository
            .createQueryBuilder('inventory_products_concentration')
            .select('MAX(inventory_products_concentration.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (maxId < 10) {
            maxId = `0${maxId}`;
        }

        const newCategory = this.concentrationRepository.create({
            ...createConcentrationDto,
            name: createConcentrationDto.name,
            //unitsConcentration: createConcentrationDto.unitsConcentration,
            // description:
            //     createConcentrationDto.name ,
            code: maxId,
            user: user,
            userUpdate: user,
        });

        try {
            await this.concentrationRepository.save(newCategory);
            return 'Concentration created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Error creating concentration',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async listConcentration(): Promise<Concentration[]> {
        return await this.concentrationRepository.find({
            where: { isActive: true },
            // relations: {
            //     unitsConcentration: true,
            // },
        });
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Concentration[] }> {
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
            isActive: query.isActive !== undefined ? query.isActive : undefined,
            createdAt: createdAt || undefined,
            updateAt: updateAt || undefined, // Add the date range filter if it exists
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.concentrationRepository.count({ relations, where }),
                query?.export
                    ? this.concentrationRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.concentrationRepository.find({
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
                'Error fetching  concentration',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<Concentration> {
        const concentration = await this.concentrationRepository.findOne({
            where: { id },
            // relations: {
            //     unitsConcentration: true,
            // },
        });

        if (!concentration) {
            throw new HttpException('Concentration not found', HttpStatus.NOT_FOUND);
        }

        return concentration;
    }

    async update(id: number, updateConcentrationDto: UpdateConcentrationDto) {
        let concentration = await this.findOne(id);

        if (!concentration) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(concentration, updateConcentrationDto);
        //concentration.description = concentration.name + concentration.unitsConcentration.name;

        try {
            await this.concentrationRepository.save(concentration);
            return `Sub Category #${id} updated successfully`;
        } catch (error) {
            throw new HttpException(
                'Error updating sub category',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    remove(id: number) {
        return `This action removes a #${id} concentration`;
    }

    async changeStatus(id: number): Promise<string> {
        const concentrartion = await this.findOne(id);
        if (!concentrartion) {
            throw new HttpException('Concentration not found', HttpStatus.NOT_FOUND);
        }

        concentrartion.isActive = !concentrartion.isActive;

        try {
            await this.concentrationRepository.save(concentrartion);
            return 'Concentration status changed successfully';
        } catch (error) {
            throw new HttpException(
                'Error changing category status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Concentración', key: 'name', width: 20 },
            { header: 'Codígo', key: 'code', width: 20 },
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

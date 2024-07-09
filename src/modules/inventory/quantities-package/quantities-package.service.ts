import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateQuantitiesPackageDto } from './dto/create-quantities-package.dto';
import { UpdateQuantitiesPackageDto } from './dto/update-quantities-package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QuantitiesPackage } from './entities/quantities-package.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class QuantitiesPackageService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(QuantitiesPackage)
        private quantitiesPackageRepository: Repository<QuantitiesPackage>,
    ) {}

    async create(
        createQuantitiesPackageDto: CreateQuantitiesPackageDto,
        userId: number,
    ): Promise<string> {
        const user = await this.usersService.findOne(userId);

        let maxId = await this.quantitiesPackageRepository
            .createQueryBuilder('inventory_products_quantities_concentration')
            .select('MAX(inventory_products_quantities_concentration.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (parseInt(maxId) < 10) {
            maxId = `0${maxId}`;
        }

        const newTypePresentation = {
            ...createQuantitiesPackageDto,
            name: createQuantitiesPackageDto.name.toUpperCase(),
            code: maxId,
            user: user,
            userUpdate: user,
        };

        try {
            await this.quantitiesPackageRepository.save(newTypePresentation);
            return 'Units concentration created successfully';
        } catch (error) {
            console.log(error);

            throw new HttpException(
                'Error creating units quantities Package',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async listQuantitiesPackage(): Promise<QuantitiesPackage[]> {
        return await this.quantitiesPackageRepository.find({
            where: { isActive: true },
        });
    }

    async findAll(query: any): Promise<{ totalRows: number; data: QuantitiesPackage[] }> {
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
            isActive: query.isActive != '' ? query.isActive : undefined,
            code: Like(`%${query.code || ''}%`),
            createdAt: createdAt || undefined,
            updateAt: updateAt || undefined,
        };
        try {
            const [resCount, resData] = await Promise.all([
                this.quantitiesPackageRepository.count({ relations, where }),
                query?.export
                    ? this.quantitiesPackageRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.quantitiesPackageRepository.find({
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
                'Error fetching quantities Package',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<QuantitiesPackage> {
        const quantityPackage = await this.quantitiesPackageRepository.findOne({
            where: { id },
        });
        if (!quantityPackage) {
            throw new HttpException('quantities Package not found', HttpStatus.NOT_FOUND);
        }
        return quantityPackage;
    }

    async update(id: number, updateQuantitiesPackageDto: UpdateQuantitiesPackageDto) {
        const quantityPackage = await this.findOne(id);
        if (!quantityPackage) {
            throw new HttpException('Type of Presentation not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(quantityPackage, updateQuantitiesPackageDto);

        try {
            await this.quantitiesPackageRepository.save(quantityPackage);
            return `quantities Package #${id} updated successfully`;
        } catch (error) {
            throw new HttpException(
                'Error updating Units concentration',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    remove(id: number) {
        return `This action removes a #${id} quantitiesPackage`;
    }

    async changeStatus(id: number): Promise<string | Error> {
        const quantityPackage = await this.quantitiesPackageRepository.findOneBy({ id });
        quantityPackage.isActive = !quantityPackage.isActive;

        try {
            await this.quantitiesPackageRepository.save(quantityPackage);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async getAllBanks(): Promise<QuantitiesPackage[]> {
        return this.quantitiesPackageRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Codígo', key: 'code', width: 20 },
            { header: 'Estados', key: 'name', width: 20 },
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

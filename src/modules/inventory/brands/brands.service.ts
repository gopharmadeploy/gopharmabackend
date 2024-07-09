import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class BrandsService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(Brand) private brandsRepository: Repository<Brand>,
    ) {}

    async create(createBrandDto: CreateBrandDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);

        let maxId = await this.brandsRepository
            .createQueryBuilder('inventory_products_brands')
            .select('MAX(inventory_products_brands.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (parseInt(maxId) < 10) {
            maxId = `0${maxId}`;
        }

        const newBrand = {
            ...createBrandDto,
            name: createBrandDto.name.toUpperCase(),
            code: maxId,
            user: user,
            userUpdate: user,
        };

        try {
            await this.brandsRepository.save(newBrand);
            return 'Brand created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException('Error creating Brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async listBrands(): Promise<Brand[]> {
        return await this.brandsRepository.find({ where: { isActive: true } });
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Brand[] }> {
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
            updateAt: updateAt || undefined, // Add the date range filter if it exists
        };
        try {
            const [resCount, resData] = await Promise.all([
                this.brandsRepository.count({ relations, where }),
                query?.export
                    ? this.brandsRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.brandsRepository.find({
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
            throw new HttpException('Error fetching brands', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: number): Promise<Brand> {
        const brand = await this.brandsRepository.findOne({ where: { id } });
        if (!brand) {
            throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
        }
        return brand;
    }

    async update(id: number, updateBrandDto: UpdateBrandDto) {
        const brand = await this.findOne(id);
        if (!brand) {
            throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(brand, updateBrandDto);

        try {
            await this.brandsRepository.save(brand);
            return `Brand #${id} updated successfully`;
        } catch (error) {
            throw new HttpException('Error updating brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: number) {
        const brand = await this.findOne(id);
        if (!brand) {
            throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
        }

        try {
            await this.brandsRepository.remove(brand);
            return `Brand #${id} removed successfully`;
        } catch (error) {
            throw new HttpException('Error removing brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateBrand = await this.brandsRepository.findOneBy({ id });
        updateBrand.isActive = !updateBrand.isActive;

        try {
            await this.brandsRepository.save(updateBrand);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async getAllBanks(): Promise<Brand[]> {
        return this.brandsRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Marca', key: 'name', width: 20 },
            { header: 'Código', key: 'Code', width: 20 },
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

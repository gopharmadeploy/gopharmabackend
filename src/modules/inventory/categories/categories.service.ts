import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class CategoriesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) {}

    async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        let maxId = await this.categoriesRepository
            .createQueryBuilder('inventory_products_categories')
            .select('MAX(inventory_products_categories.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (maxId < 10) {
            maxId = `0${maxId}`;
        }

        const newCategory = this.categoriesRepository.create({
            ...createCategoryDto,
            name: createCategoryDto.name.toUpperCase(),
            code: maxId,
            user: user,
            userUpdate: user,
        });

        try {
            await this.categoriesRepository.save(newCategory);
            return 'Category created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException('Error creating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Category[] }> {
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
                this.categoriesRepository.count({ relations, where }),
                query?.export
                    ? this.categoriesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.categoriesRepository.find({
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
            throw new HttpException('Error fetching categories', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoriesRepository.findOne({ where: { id } });
        if (!category) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }
        return category;
    }

    async listCategories(): Promise<Category[]> {
        return await this.categoriesRepository.find({ where: { isActive: true } });
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto) {
        const category = await this.findOne(id);
        if (!category) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(category, updateCategoryDto);

        try {
            await this.categoriesRepository.save(category);
            return `Category #${id} updated successfully`;
        } catch (error) {
            throw new HttpException('Error updating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: number) {
        const category = await this.findOne(id);
        if (!category) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        try {
            await this.categoriesRepository.remove(category);
            return `Category #${id} removed successfully`;
        } catch (error) {
            throw new HttpException('Error removing category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(id: number): Promise<string> {
        const category = await this.findOne(id);
        if (!category) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        category.isActive = !category.isActive;

        try {
            await this.categoriesRepository.save(category);
            return 'Category status changed successfully';
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
            { header: 'Categoria', key: 'name', width: 20 },
            { header: 'Código', key: 'code', width: 20 },
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

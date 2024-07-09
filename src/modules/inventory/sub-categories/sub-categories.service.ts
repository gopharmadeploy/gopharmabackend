import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategory } from './entities/sub-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Raw, Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class SubCategoriesService {
    constructor(
        private usersService: UsersService,
        private categoriesService: CategoriesService,
        @InjectRepository(SubCategory)
        private subCategoriesRepository: Repository<SubCategory>,
    ) {}

    async create(createSubCategoryDto: CreateSubCategoryDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        let maxId = await this.subCategoriesRepository
            .createQueryBuilder('inventory_products_sub_category')
            .select('MAX(inventory_products_sub_category.id)', 'max')
            .getRawOne();

        maxId = maxId.max ? parseInt(maxId.max) + 1 : 1;

        if (maxId < 10) {
            maxId = `0${maxId}`;
        }

        const newCategory = this.subCategoriesRepository.create({
            ...createSubCategoryDto,
            name: createSubCategoryDto.name.toUpperCase(),
            category: createSubCategoryDto.category,
            subCategoryFather: createSubCategoryDto.subCategoryFather,
            code: maxId,
            user: user,
            userUpdate: user,
        });

        try {
            await this.subCategoriesRepository.save(newCategory);
            return 'Sub Category created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Error creating sub category',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async listSubCategories(): Promise<SubCategory[]> {
        const subCategories = await this.subCategoriesRepository.find({
            where: {
                isActive: true,
            },

            relations: ['category', 'subCategoryFather'],
        });

        const newSubCategoriesPhather = subCategories
            .map((el) => {
                if (el.subCategoryFather == null) {
                    return {
                        ...el,
                        children: subCategories.filter(
                            (cat) => cat.subCategoryFather && cat.subCategoryFather.id === el.id,
                        ),
                    };
                }
                return undefined;
            })
            .filter((el) => el !== undefined);

        return newSubCategoriesPhather;
    }

    async findAll(query: any): Promise<{ totalRows: number; data: SubCategory[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            user: true,
            userUpdate: true,
            category: true,
            //subCategoryFather: true,
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
            code: Like(`%${query.code || ''}%`),
            category: {
                name: Like(`%${query.category || ''}%`),
            },
            // subCategoryFather: {
            //     name: Like(`%${query.subCategory || ''}%`),
            // },
            createdAt: createdAt || undefined,
            updateAt: updateAt || undefined, // Add the date range filter if it exists
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.subCategoriesRepository.count({ relations, where }),
                query?.export
                    ? this.subCategoriesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.subCategoriesRepository.find({
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

    async findOne(id: number): Promise<SubCategory> {
        const subCategory = await this.subCategoriesRepository.findOne({
            where: { id },
            relations: {
                category: true,
                subCategoryFather: true,
            },
        });

        if (!subCategory) {
            throw new HttpException('Sub Category not found', HttpStatus.NOT_FOUND);
        }

        return subCategory;
    }

    async update(id: number, updateSubCategoryDto: UpdateSubCategoryDto) {
        const subCategory = await this.findOne(id);
        console.log(updateSubCategoryDto);
        if (!subCategory) {
            throw new HttpException('Sub Category not found', HttpStatus.NOT_FOUND);
        }

        Object.assign(subCategory, updateSubCategoryDto);

        try {
            await this.subCategoriesRepository.save(subCategory);
            return `Sub Category #${id} updated successfully`;
        } catch (error) {
            throw new HttpException(
                'Error updating sub category',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    remove(id: number) {
        return `This action removes a #${id} subCategory`;
    }

    async changeStatus(id: number): Promise<string> {
        const subCategory = await this.findOne(id);
        if (!subCategory) {
            throw new HttpException('Sub Category not found', HttpStatus.NOT_FOUND);
        }

        subCategory.isActive = !subCategory.isActive;

        try {
            await this.subCategoriesRepository.save(subCategory);
            return 'Sub Category status changed successfully';
        } catch (error) {
            throw new HttpException(
                'Error changing category status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getAllBanks(): Promise<SubCategory[]> {
        return this.subCategoriesRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Codígo', key: 'code', width: 20 },
            { header: 'Sub categoría', key: 'name', width: 20 },
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

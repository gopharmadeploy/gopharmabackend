import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';
import { UsersService } from 'src/modules/config/users/users.service';
import { SubCategoriesService } from '../sub-categories/sub-categories.service';
import { Catalogue } from './entities/catalogue.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as fs from 'node:fs';

@Injectable()
export class CatalogueService {
    constructor(
        private usersService: UsersService,
        private subCategoriesService: SubCategoriesService,
        @InjectRepository(Catalogue)
        private catalogueRepository: Repository<Catalogue>,
    ) {}

    async create(
        createCatalogueDto: CreateCatalogueDto,
        userId: number,
        filename: string | null,
    ): Promise<string> {
        console.log(createCatalogueDto);

        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const codeNew = createCatalogueDto.code;
        const queryBuilder = this.catalogueRepository
            .createQueryBuilder('inventory_products_catalogue')
            .select('COUNT(*)', 'cant')
            .where('SUBSTRING(inventory_products_catalogue.code, 1, 18) = :code', {
                code: codeNew.substring(0, 18),
            });

        // const sqlQuery = queryBuilder.getSql();
        // console.log('Generated SQL Query:', sqlQuery);

        const result = await queryBuilder.getRawOne();
        let count = result.cant;

        if (count < 10) {
            count = `0${count}`;
        }

        const newCategory = this.catalogueRepository.create({
            ...createCatalogueDto,
            name: createCatalogueDto.name.toUpperCase(),
            subCategory: JSON.parse(createCatalogueDto.subCategory),
            brand: JSON.parse(createCatalogueDto.brand),
            typesPresentation: JSON.parse(createCatalogueDto.typesPresentation),
            unitMeasurement: JSON.parse(createCatalogueDto.unitMeasurement),
            unitConcentration: JSON.parse(createCatalogueDto.unitConcentration),
            typesPackaging: JSON.parse(createCatalogueDto.typesPackaging),
            quantityPackage: JSON.parse(createCatalogueDto.quantityPackage),
            code: createCatalogueDto.code + count,
            description: createCatalogueDto.description,
            pharmaceuticalDescription: createCatalogueDto.pharmaceuticalDescription,
            concentration: JSON.parse(createCatalogueDto.concentration),
            user: user,
            userUpdate: user,
            img: filename,
        });

        try {
            await this.catalogueRepository.save(newCategory);
            return 'Product add catalogue successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Error Product add catalogue',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Catalogue[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            user: true,
            userUpdate: true,
            subCategory: true,
            // brand: true,
            // concentration: true,
            // typesPresentation: true,
            // unitConcentration: true,
            // typesPackaging: true,
            // unitMeasurement: true,
            // quantityPackage: true,
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
            subCategory: {
                name: Like(`%${query.subCategory || ''}%`),
            },
            createdAt: createdAt || undefined,
            updateAt: updateAt || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive : undefined,
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.catalogueRepository.count({ relations, where }),
                query?.export
                    ? this.catalogueRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.catalogueRepository.find({
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

    async findOne(id: number): Promise<Catalogue> {
        const subCategory = await this.catalogueRepository.findOne({
            where: { id },
            relations: {
                subCategory: {
                    category: true,
                },
                brand: true,
                concentration: true,
                typesPresentation: true,
                unitConcentration: true,
                typesPackaging: true,
                unitMeasurement: true,
                quantityPackage: true,
            },
        });

        if (!subCategory) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        return subCategory;
    }

    async update(
        id: number,
        updateCatalogueDto: UpdateCatalogueDto,
        userId: number,
        filename: string | null,
    ) {
        const user = await this.usersService.findOne(userId);
        const productCatalogue = await this.findOne(id);
        const oldImage = productCatalogue.img;
        console.log(oldImage);
        if (!productCatalogue) {
            throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        }

        const newCode = updateCatalogueDto.code;
        const queryBuilder = this.catalogueRepository
            .createQueryBuilder('inventory_products_catalogue')
            .select('COUNT(*)', 'cant')
            .where(
                'inventory_products_catalogue.id <> :id and SUBSTRING(inventory_products_catalogue.code, 1, 18) = :code',
                {
                    id: id,
                    code: newCode.substring(0, 18),
                },
            );
        // const sqlQuery = queryBuilder.getSql();
        // console.log('Generated SQL Query:', sqlQuery);

        const result = await queryBuilder.getRawOne();
        let count = result.cant;

        if (count < 10) {
            count = `0${count}`;
        }

        Object.assign(productCatalogue, updateCatalogueDto);

        productCatalogue.code = newCode.substring(0, 18) + count;
        productCatalogue.name = productCatalogue.name.toUpperCase();
        productCatalogue.subCategory = JSON.parse(updateCatalogueDto.subCategory);
        productCatalogue.brand = JSON.parse(updateCatalogueDto.brand);
        productCatalogue.typesPresentation = JSON.parse(updateCatalogueDto.typesPresentation);
        productCatalogue.unitMeasurement = JSON.parse(updateCatalogueDto.unitMeasurement);
        productCatalogue.unitConcentration = JSON.parse(updateCatalogueDto.unitConcentration);
        productCatalogue.typesPackaging = JSON.parse(updateCatalogueDto.typesPackaging);
        productCatalogue.quantityPackage = JSON.parse(updateCatalogueDto.quantityPackage);
        productCatalogue.code = productCatalogue.code + count;
        productCatalogue.description = productCatalogue.description;
        productCatalogue.pharmaceuticalDescription = productCatalogue.pharmaceuticalDescription;
        productCatalogue.concentration = JSON.parse(updateCatalogueDto.concentration);
        productCatalogue.userUpdate = user;
        productCatalogue.img = filename;

        try {
            oldImage && fs.unlinkSync(`./uploads/inventory/catalogue/img/${oldImage}`);

            await this.catalogueRepository.save(productCatalogue);
            return `Product #${id} updated successfully`;
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'Error updating sub category',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    remove(id: number) {
        return `This action removes a #${id} catalogue`;
    }

    async changeStatus(id: number): Promise<string> {
        const productCatalogue = await this.findOne(id);
        if (!productCatalogue) {
            throw new HttpException('Sub Category not found', HttpStatus.NOT_FOUND);
        }

        productCatalogue.isActive = !productCatalogue.isActive;

        try {
            await this.catalogueRepository.save(productCatalogue);
            return 'Sub Category status changed successfully';
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
            { header: 'Id', key: 'id', width: 20 },
            { header: 'Codígo', key: 'code', width: 20 },
            { header: 'Producto', key: 'name', width: 20 },
            { header: 'Descripción', key: 'description', width: 20 },
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

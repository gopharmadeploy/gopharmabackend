import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentType } from './entities/document-type.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class DocumentTypesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(DocumentType) private documentTypesRepository: Repository<DocumentType>,
    ) {}

    async create(createDocumentTypeDto: CreateDocumentTypeDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);

        const newDocumentType = {
            ...createDocumentTypeDto,
            user: user,
            userUpdate: user,
        };

        try {
            await this.documentTypesRepository.save(newDocumentType);
            return 'DocumentType created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException('Error creating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: DocumentType[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            identificationType: true,
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
            identificationType: query.identificationType && {
                name: Like(`%${query.identificationType || ''}%`),
            },
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.documentTypesRepository.count({ where }),
                query?.export
                    ? this.documentTypesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.documentTypesRepository.find({
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

    async findOne(id: number): Promise<DocumentType> {
        const documentType = await this.documentTypesRepository.findOne({
            where: { id },
            relations: { identificationType: true },
        });
        if (!documentType) throw new HttpException('DocumentType not found', HttpStatus.NOT_FOUND);
        return documentType;
    }

    async update(id: number, updateDocumentTypeDto: UpdateDocumentTypeDto) {
        const brand = await this.findOne(id);
        if (!brand) throw new HttpException('DocumentType not found', HttpStatus.NOT_FOUND);

        Object.assign(brand, updateDocumentTypeDto);

        try {
            await this.documentTypesRepository.save(brand);
            return `DocumentType #${id} updated successfully`;
        } catch (error) {
            throw new HttpException('Error updating brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: number) {
        const documentType = await this.findOne(id);
        if (!documentType) throw new HttpException('DocumentType not found', HttpStatus.NOT_FOUND);

        try {
            await this.documentTypesRepository.remove(documentType);
            return `DocumentType #${id} removed successfully`;
        } catch (error) {
            throw new HttpException('Error removing brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateDocumentType = await this.documentTypesRepository.findOneBy({ id });
        updateDocumentType.isActive = !updateDocumentType.isActive;

        try {
            await this.documentTypesRepository.save(updateDocumentType);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listDocumentTypes(query: any): Promise<DocumentType[]> {
        const options: any = { where: { isActive: true } };

        if (query.identificationTypeId) {
            options.relations = { identificationType: true };
            options.where.identificationType = { id: +query.identificationTypeId };
        }

        return await this.documentTypesRepository.find(options);
    }
    async getAllBanks(): Promise<DocumentType[]> {
        return this.documentTypesRepository.find();
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateClientTypeDto } from './dto/create-client-type.dto';
import { UpdateClientTypeDto } from './dto/update-client-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientType } from './entities/client-type.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class ClientTypesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(ClientType) private clientTypesRepository: Repository<ClientType>,
    ) {}

    async create(createClientTypeDto: CreateClientTypeDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);

        const newClientType = {
            ...createClientTypeDto,
            user: user,
            userUpdate: user,
        };

        try {
            await this.clientTypesRepository.save(newClientType);
            return 'ClientType created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException('Error creating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: ClientType[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
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
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };
        try {
            const [resCount, resData] = await Promise.all([
                this.clientTypesRepository.count({ where }),
                query?.export
                    ? this.clientTypesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.clientTypesRepository.find({
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

    async findOne(id: number): Promise<ClientType> {
        const clientType = await this.clientTypesRepository.findOne({ where: { id } });
        if (!clientType) throw new HttpException('ClientType not found', HttpStatus.NOT_FOUND);
        return clientType;
    }

    async update(id: number, updateClientTypeDto: UpdateClientTypeDto) {
        const brand = await this.findOne(id);
        if (!brand) throw new HttpException('ClientType not found', HttpStatus.NOT_FOUND);

        Object.assign(brand, updateClientTypeDto);

        try {
            await this.clientTypesRepository.save(brand);
            return `ClientType #${id} updated successfully`;
        } catch (error) {
            throw new HttpException('Error updating brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: number) {
        const clientType = await this.findOne(id);
        if (!clientType) throw new HttpException('ClientType not found', HttpStatus.NOT_FOUND);

        try {
            await this.clientTypesRepository.remove(clientType);
            return `ClientType #${id} removed successfully`;
        } catch (error) {
            throw new HttpException('Error removing brand', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateClientType = await this.clientTypesRepository.findOneBy({ id });
        updateClientType.isActive = !updateClientType.isActive;

        try {
            await this.clientTypesRepository.save(updateClientType);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listClientTypes(): Promise<ClientType[]> {
        return await this.clientTypesRepository.find({ where: { isActive: true } });
    }

    async getAllBanks(): Promise<ClientType[]> {
        return this.clientTypesRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [{ header: 'Tipo de cliente', key: 'name', width: 20 }];
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

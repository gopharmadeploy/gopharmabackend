import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Not, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class ClientsService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(Client) private clientsRepository: Repository<Client>,
    ) {}

    async create(createClientDto: CreateClientDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);

        const validator = await this.clientsRepository.exists({
            where: {
                identification: createClientDto.identification,
            },
        });

        if (validator) throw new HttpException('El cliente ya existe', HttpStatus.BAD_REQUEST);

        const newClient = {
            ...createClientDto,
            user: user,
            userUpdate: user,
        };

        try {
            await this.clientsRepository.save(newClient);
            return 'Client created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException('Error creating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Client[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            user: true,
            userUpdate: true,
            city: { state: true },
            clientType: true,
            documentType: {
                identificationType: true,
            },
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
            city: query.city && {
                name: Like(`%${query.city || ''}%`),
            },
            clientType: query.clientType && {
                name: Like(`%${query.clientType || ''}%`),
            },
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };
        try {
            const [resCount, resData] = await Promise.all([
                this.clientsRepository.count({ where }),
                query?.export
                    ? this.clientsRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.clientsRepository.find({
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

    async findOne(id: number): Promise<Client> {
        const client = await this.clientsRepository.findOne({
            where: { id },
            relations: {
                city: { state: true },
                clientType: true,
                taxpayer: true,
                documentType: { identificationType: true },
            },
        });
        if (!client) throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
        return client;
    }

    async update(id: number, updateClientDto: UpdateClientDto) {
        const client = await this.findOne(id);
        if (!client) throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
        const validator = await this.clientsRepository.exists({
            where: {
                identification: updateClientDto.identification,
                id: Not(id),
            },
        });
        if (validator) throw new HttpException('El cliente ya existe', HttpStatus.BAD_REQUEST);

        Object.assign(client, updateClientDto);

        try {
            await this.clientsRepository.save(client);
            return `Client #${id} updated successfully`;
        } catch (error) {
            throw new HttpException('Error updating client', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: number) {
        const client = await this.findOne(id);
        if (!client) throw new HttpException('Client not found', HttpStatus.NOT_FOUND);

        try {
            await this.clientsRepository.remove(client);
            return `Client #${id} removed successfully`;
        } catch (error) {
            throw new HttpException('Error removing client', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateClient = await this.clientsRepository.findOneBy({ id });
        updateClient.isActive = !updateClient.isActive;

        try {
            await this.clientsRepository.save(updateClient);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async getAllBanks(): Promise<Client[]> {
        return this.clientsRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Cliente', key: 'name', width: 20 },
            { header: 'Telefono', key: 'phone', width: 20 },
            { header: 'Correo electronico', key: 'email', width: 20 },
            { header: 'Observaciones', key: 'observations', width: 20 },
            { header: 'Direccion    ', key: 'address', width: 20 },
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

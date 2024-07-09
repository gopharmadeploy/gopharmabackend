import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './entities/status.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
// import { CreateActionDto } from 'src/actions/dto/create-action.dto';
// import { Action } from 'src/actions/entities/action.entity';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatusService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(Status) private statusRepository: Repository<Status>,
    ) {}

    async create(createStatusDto: CreateStatusDto, userId: number): Promise<string> {
        console.log('Creating status...');
        console.log(createStatusDto); // Verificar el objeto de estado recibido
        console.log(userId); // Verificar si el ID de usuario se está recibiendo correctamente

        const user = await this.usersService.findOne(userId);
        const newStatus = new Status();
        newStatus.status = createStatusDto.status.toUpperCase();
        newStatus.module = createStatusDto.module;
        newStatus.user = user;
        newStatus.userUpdate = user;

        // Crear un nuevo estado

        try {
            await this.statusRepository.save(newStatus);
            return '¡Status creado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Status[] }> {
        console.log('da query', query);

        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const where = this.buildWhereClause(query);

        try {
            const [resCount, resData] = await Promise.all([
                this.statusRepository.count({ where }),
                query?.export
                    ? this.statusRepository.find({
                          where,
                          order: { id: order },
                          relations: ['user', 'userUpdate'],
                      })
                    : this.statusRepository.find({
                          where,
                          order: { id: order },
                          take,
                          skip,
                          relations: ['user', 'userUpdate'],
                      }),
            ]);

            console.log('data', resData);

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

    private buildWhereClause(query: any) {
        const where: any = {};

        // Filtro por estado activo
        if (query.isActive !== undefined) {
            where.isActive = query.isActive === 'true';
        }

        // Filtro por nombre de status
        if (query.status) {
            where.status = Raw((alias) => `${alias} LIKE '%${query.status}%'`);
        }

        // Filtro por correo
        if (query.module) {
            where.module = Raw((alias) => `${alias} LIKE '%${query.module}%'`);
        }

        // Filtro por rango de fechas en createdAt
        if (query.createdAt) {
            const [startDate, endDate] = query.createdAt.split(',');
            where.createdAt = Raw(
                (createdAt) =>
                    `${createdAt} BETWEEN '${new Date(startDate).toISOString()}' AND '${new Date(endDate).toISOString()}'`,
            );
        }

        // Filtro por rango de fechas en updatedAt
        if (query.updatedAt) {
            const [startDate, endDate] = query.updatedAt.split(',');
            where.updatedAt = Raw(
                (updatedAt) =>
                    `${updatedAt} BETWEEN '${new Date(startDate).toISOString()}' AND '${new Date(endDate).toISOString()}'`,
            );
        }

        return where;
    }

    async findOne(id: number): Promise<Status> {
        return await this.statusRepository.findOne({
            where: { id },
            relations: ['user', 'userUpdate'],
        });
    }

    async update(id: number, updateStatusDto: UpdateStatusDto): Promise<Status> {
        const statusToUpdate = await this.statusRepository.findOne({ where: { id } });
        this.statusRepository.merge(statusToUpdate, updateStatusDto);
        return await this.statusRepository.save(statusToUpdate);
    }

    async inactivate(id: number): Promise<Status> {
        const statusToInactivate = await this.statusRepository.findOne({ where: { id } });
        statusToInactivate.isActive = false;
        return await this.statusRepository.save(statusToInactivate);
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateStatus = await this.statusRepository.findOneBy({ id });
        updateStatus.isActive = !updateStatus.isActive;

        try {
            await this.statusRepository.save(updateStatus);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async getAllBanks(): Promise<Status[]> {
        return this.statusRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Estatus', key: 'status', width: 20 },
            { header: 'Modulos', key: 'module', width: 20 },
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

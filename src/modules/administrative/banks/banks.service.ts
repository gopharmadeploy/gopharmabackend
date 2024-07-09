import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrative_Bank } from './entities/bank.entity';
import { Repository, Like, Raw, Between, Equal } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class BanksService {
    constructor(
        @InjectRepository(Administrative_Bank)
        private bankRepository: Repository<Administrative_Bank>,
    ) {}

    create(createBankDto: CreateBankDto) {
        const newBank = this.bankRepository.create(createBankDto);
        this.bankRepository.save(newBank);
        return 'This action adds a new bank';
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Administrative_Bank[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        let dateRange: any;

        if (query.updateAt) {
            const dates = query.updateAt.split(',');
            if (dates.length === 2) {
                dateRange = Between(new Date(dates[0]), new Date(dates[1]));
            }
        } else if (query.createAt) {
            const dates = query.createAt.split(',');
            if (dates.length === 2) {
                dateRange = Between(new Date(dates[0]), new Date(dates[1]));
            }
        }

        const where = {
            id: Raw((id) => `CAST(${id} as char) Like '%${query.id || ''}%'`),
            name: Like(`%${query.name || ''}%`),
            email: Like(`%${query.email || ''}%`),
            branch: Like(`%${query.branch || ''}%`),
            adress: Like(`%${query.adress || ''}%`),
            urbanization: Like(`%${query.urbanization || ''}%`),
            street: Like(`%${query.street || ''}%`),
            swift: Like(`%${query.swift || ''}%`),
            building: Like(`%${query.building || ''}%`),
            municipality: Like(`%${query.municipality || ''}%`),
            city: Like(`%${query.city || ''}%`),
            aba: Like(`%${query.aba || ''}%`),
            codeZip: Like(`%${query.codeZip || ''}%`),
            bankCode: query.bankCode ? Equal(query.bankCode) : undefined,
            routeNumber: query.routeNumber ? Equal(query.routeNumber) : undefined,
            ssn: query.ssn ? Equal(query.ssn) : undefined,
            phone:
                query.phoneStart && query.phoneEnd
                    ? Between(query.phoneStart, query.phoneEnd)
                    : undefined,
            updateAt: dateRange || undefined, // Add the date range filter if it exists
            createAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.bankRepository.count({ where }),
                query?.export
                    ? this.bankRepository.find({
                          where,
                          order: { id: order },
                      })
                    : this.bankRepository.find({
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

    async findOne(id: number): Promise<Administrative_Bank> {
        return await this.bankRepository.findOne({ where: { id: id } });
    }

    update(id: number, updateBankDto: UpdateBankDto) {
        this.bankRepository.update({ id: id }, updateBankDto);
        return `This action updates a #${id} bank`;
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateStatus = await this.bankRepository.findOneBy({ id });
        updateStatus.isActive = !updateStatus.isActive;

        try {
            await this.bankRepository.save(updateStatus);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async getAllBanks(): Promise<Administrative_Bank[]> {
        return this.bankRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');
        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Nombre:', key: 'name', width: 20 },
            { header: 'Correo Electronico:', key: 'email', width: 20 },
            { header: 'Sucursal:', key: 'branch', width: 20 },
            { header: 'Dirección (corta):', key: 'adress', width: 20 },
            { header: 'Código Banco:', key: 'bankCode', width: 20 },
            { header: 'Telefono:', key: 'phone', width: 20 },
            { header: 'Aba:', key: 'aba', width: 20 },
            { header: 'Numero De Ruta:', key: 'routeNumber', width: 20 },
            { header: 'Swift:', key: 'swift', width: 20 },
            { header: 'Urbanización / Barrio:', key: 'urbanization', width: 20 },
            { header: 'Calla / Av:', key: 'street', width: 20 },
            { header: 'Casa / Edificio:', key: 'building', width: 20 },
            { header: 'Municipio / Pueblo:', key: 'municipality', width: 20 },
            { header: 'Ciudad / Banco:', key: 'city', width: 20 },
            { header: 'ZIP Code:', key: 'codeZip', width: 20 },
        ];
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

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader('Content-Disposition', `attachment; filename=data.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    }
}

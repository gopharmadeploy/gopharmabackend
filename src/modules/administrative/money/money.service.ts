import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMoneyDto } from './dto/create-money.dto';
import { UpdateMoneyDto } from './dto/update-money.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrative_Money } from './entities/money.entity';
import { Repository, Like, Raw, Between } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class MoneyService {
    constructor(
        @InjectRepository(Administrative_Money)
        private moneyRepository: Repository<Administrative_Money>,
    ) {}

    create(createMoneyDto: CreateMoneyDto) {
        const newMoney = this.moneyRepository.create(createMoneyDto);
        console.log(newMoney);
        this.moneyRepository.save(newMoney);
        console.log(" crando moneda")
        return 'This action adds a new money';
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Administrative_Money[] }> {
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
            money: Like(`%${query.money || ''}%`),
            symbol: Like(`%${query.symbol || ''}%`),
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.moneyRepository.count({ where }),
                query?.export
                    ? this.moneyRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.moneyRepository.find({
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

    async findOne(id: number): Promise<Administrative_Money> {
        return await this.moneyRepository.findOne({ where: { id: id } });
    }

    update(id: number, updateMoneyDto: UpdateMoneyDto) {
        this.moneyRepository.update({ id: id }, updateMoneyDto);
        return `This action updates a #${id} money`;
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateStatus = await this.moneyRepository.findOneBy({ id });
        updateStatus.isActive = !updateStatus.isActive;

        try {
            await this.moneyRepository.save(updateStatus);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (err) {
            throw err;
        }
    }

    async getAllBanks(): Promise<Administrative_Money[]> {
        return this.moneyRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.columns = [
            { header: 'Moneda:', key: 'money', width: 20 },
            { header: 'Simbolo:', key: 'symbol', width: 20 },
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

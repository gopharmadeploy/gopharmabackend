import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateExchangeRateDto } from './dto/create-exchange_rate.dto';
// import { UpdateExchangeRateDto } from './dto/update-exchange_rate.dto';
import { ExchangeRate } from './entities/exchange_rate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository, getManager } from 'typeorm';
import { Administrative_Money } from '../money/entities/money.entity';
import { ScrappingServiceService } from '../scrapping_service/scrapping_service.service';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class ExchangeRateService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(ExchangeRate) private exchangeRepository: Repository<ExchangeRate>,
        @InjectRepository(Administrative_Money)
        private moneyRepository: Repository<Administrative_Money>,
        @Inject(forwardRef(() => ScrappingServiceService))
        private readonly scrappingServiceService: ScrappingServiceService,
    ) {}

    async create(createExchangeRateDto: CreateExchangeRateDto, userId: number) {
        //console.log('body recibido en exchangerate', createExchangeRateDto);

        //1
        const user = await this.usersService.findOne(userId);
        const currency = await this.moneyRepository.findOne({
            where: { id: createExchangeRateDto.currencyId },
        });
        const exchangeToCurrency = await this.moneyRepository.findOne({
            where: { id: createExchangeRateDto.exchangeToCurrency },
        });

        if (!currency || !exchangeToCurrency) {
            throw new HttpException(
                'Una o ambas monedas seleccionadas para la tasa no existen',
                404,
            );
        }

        if (isNaN(createExchangeRateDto.exchange)) {
            throw new HttpException('No se recibió correctamente la tasa', 401);
        }

        // Comprobar si ya existe una tasa de cambio igual
        const existingRate = await this.exchangeRepository.findOne({
            where: {
                currencyId: { id: createExchangeRateDto.currencyId },
                exchangeToCurrency: { id: createExchangeRateDto.exchangeToCurrency },
                exchange: createExchangeRateDto.exchange,
                isActive: true,
            },
        });

        if (existingRate) {
            throw new HttpException('La tasa de cambio ya existe y está activa', 409);
        }

        //2
        // Desactivar tasas de cambio anteriores
        await this.exchangeRepository.update(
            {
                currencyId: { id: createExchangeRateDto.currencyId },
                exchangeToCurrency: { id: createExchangeRateDto.exchangeToCurrency },
                isActive: true,
            },
            { isActive: false },
        );

        //3
        const exchange_rate = new ExchangeRate();
        exchange_rate.user = user;
        exchange_rate.currencyId = currency;
        exchange_rate.exchangeToCurrency = exchangeToCurrency;
        exchange_rate.exchange = createExchangeRateDto.exchange;
        exchange_rate.isActive = true;

        try {
            await this.exchangeRepository.save(exchange_rate);
            return '¡Tasa de cambio creada con éxito!';
        } catch (error) {
            console.log('ERROR GUARDANDO LA TASA');
            throw new HttpException(
                'Ocurrió un error inesperado guardando la tasa, inténtelo más tarde',
                500,
            );
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: ExchangeRate[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const where = this.buildWhereClause(query);

        const [totalRows, data] = await Promise.all([
            this.exchangeRepository.count({
                where,
                relations: ['currencyId', 'exchangeToCurrency', 'user'],
            }),
            query?.export
                ? this.exchangeRepository.find({
                      where,
                      relations: ['currencyId', 'exchangeToCurrency', 'user'],
                      order: { id: order },
                  })
                : this.exchangeRepository.find({
                      where,
                      relations: ['currencyId', 'exchangeToCurrency', 'user'],
                      order: { id: order },
                      take,
                      skip,
                  }),
        ]);

        return { totalRows, data };
    }

    private buildWhereClause(query: any) {
        const where: any = {};

        // Filtro por ID
        if (query.id) {
            where.id = Raw((id) => `CAST(${id} as char) LIKE '%${query.id}%'`);
        }

        // Filtro por estado activo
        if (query.isActive !== undefined) {
            where.isActive = query.isActive === 'true';
        }

        // Filtro por nombre de moneda (currencyId)
        if (query.currencyId) {
            where.currencyId = { money: Raw((money) => `money LIKE '%${query.currencyId}%'`) };
        }

        // Filtro por nombre de moneda (exchangeToCurrency)
        if (query.exchange) {
            where.exchange = Raw(
                (exchange) => `CAST(${exchange} as char) LIKE '%${query.exchange}%'`,
            );
        }

        // Filtro por rango de fechas en createdAt
        if (query.createdAt) {
            const [startDate, endDate] = query.createdAt.split(',');
            where.createdAt = Raw(
                (createdAt) =>
                    `${createdAt} BETWEEN '${new Date(startDate).toISOString()}' AND '${new Date(endDate).toISOString()}'`,
            );
        }

        return where;
    }

    async findOne(id: number): Promise<ExchangeRate> {
        return await this.exchangeRepository.findOne({
            where: { id },
            relations: ['currencyId', 'exchangeToCurrency'],
        });
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateStatus = await this.exchangeRepository.findOneBy({ id });
        updateStatus.isActive = !updateStatus.isActive;
        try {
            await this.exchangeRepository.save(updateStatus);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Tasas de Cambio']);
        worksheet.columns = [
            { header: 'Fecha de Creación', key: 'createdAt', width: 25 },
            { header: 'Moneda de Referencia:', key: 'currencyId', width: 20 },
            { header: 'Moneda transformada:', key: 'exchangeToCurrency', width: 20 },
            { header: 'Tasa de cambio:', key: 'exchange', width: 20 },
            { header: 'Registrado por', key: 'user', width: 20 },
        ];

        // Aplicar estilos a la cabecera
        worksheet.getRow(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '2a953d' },
        };
        worksheet.getRow(2).font = { bold: true };
        worksheet.getRow(2).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(2).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        // Agregar datos y aplicar estilos
        data.forEach((item) => {
            const flattenedItem = {
                createdAt: item.createdAt,
                exchangeToCurrency: item.exchangeToCurrency ? item.exchangeToCurrency.money : '',
                currencyId: item.currencyId ? item.currencyId.money : '',
                exchange: item.exchange,
                user: item.user.name,
            };

            const row = worksheet.addRow(flattenedItem);

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
        res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');

        // Escribir el libro de trabajo en la respuesta HTTP
        await workbook.xlsx.write(res);
        res.end();
    }

    async findActiveExchangeRates(): Promise<ExchangeRate[]> {
        return await this.exchangeRepository.find({
            where: [
                {
                    currencyId: { id: 1 },
                    exchangeToCurrency: { id: 2 },
                    isActive: true,
                },
                {
                    currencyId: { id: 3 },
                    exchangeToCurrency: { id: 2 },
                    isActive: true,
                },
            ],
            relations: ['currencyId', 'exchangeToCurrency'],
        });
    }
}

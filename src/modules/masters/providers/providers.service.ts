import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Provider } from './entities/provider.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Raw, Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class ProvidersService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(Provider) private providersRepository: Repository<Provider>,
    ) {}

    async create(createProviderDto: CreateProviderDto, userId: number): Promise<string> {
        const user = await this.usersService.findOne(userId);

        const newProvider = {
            ...createProviderDto,
            name: createProviderDto.name.toUpperCase(),
            user: user,
            userUpdate: user,
        };

        try {
            await this.providersRepository.save(newProvider);
            return 'Provider created successfully';
        } catch (error) {
            console.log(error);
            throw new HttpException('Error creating category', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Provider[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            user: true,
            userUpdate: true,
        };

        const where = {
            id: Raw((id) => `CAST(${id} as char) Like '%${query.id || ''}%'`),
            name: Like(`%${query.name || ''}%`),
            isActive: query.isActive != '' ? query.isActive : undefined,
        };
        try {
            const getCount = this.providersRepository.count({ relations, where });
            const getData = this.providersRepository.find({
                relations,
                where,
                order: { id: order },
                take,
                skip,
            });
            const [resCount, resData] = await Promise.all([getCount, getData]);
            return {
                totalRows: resCount,
                data: resData,
            };
        } catch (error) {
            throw new HttpException('Error fetching providers', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: number): Promise<Provider> {
        const provider = await this.providersRepository.findOne({ where: { id } });
        if (!provider) throw new HttpException('Provider not found', HttpStatus.NOT_FOUND);
        return provider;
    }

    async update(id: number, updateProviderDto: UpdateProviderDto) {
        const providers = await this.findOne(id);
        if (!providers) throw new HttpException('Provider not found', HttpStatus.NOT_FOUND);

        Object.assign(providers, updateProviderDto);

        try {
            await this.providersRepository.save(providers);
            return `Provider #${id} updated successfully`;
        } catch (error) {
            throw new HttpException('Error updating providers', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(id: number) {
        const provider = await this.findOne(id);
        if (!provider) throw new HttpException('Provider not found', HttpStatus.NOT_FOUND);

        try {
            await this.providersRepository.remove(provider);
            return `Provider #${id} removed successfully`;
        } catch (error) {
            throw new HttpException('Error removing providers', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateProvider = await this.providersRepository.findOneBy({ id });
        updateProvider.isActive = !updateProvider.isActive;

        try {
            await this.providersRepository.save(updateProvider);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async getAllBanks(): Promise<Provider[]> {
        return this.providersRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Provedor', key: 'name', width: 20 },
            { header: 'Direccion', key: 'address', width: 20 },
            { header: 'Sitio web', key: 'website', width: 20 },
            { header: 'Porcentaje de retencion', key: 'taxRetentionPercentaje', width: 20 },
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

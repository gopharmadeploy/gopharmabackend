import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-cities.dto';
import { UpdateCityDto } from './dto/update-cities.dto';
import { City } from './entities/city.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from 'src/modules/config/users/users.service';

@Injectable()
export class CitiesService {
    constructor(
        private usersService: UsersService,
        @InjectRepository(City) private citiesRepository: Repository<City>,
    ) {}

    async create(createCityDto: CreateCityDto, userId: number): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);

        const newCity = {
            ...createCityDto,
            name: createCityDto.name.toUpperCase(),
            user: user,
            userUpdate: user,
        };

        try {
            await this.citiesRepository.save(newCity);
            return '¡Ciudad creada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: City[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';

        const relations = {
            state: true,
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
            state: query.state && {
                name: Like(`%${query.state || ''}%`),
            },
            updatedAt: dateRange || undefined, // Add the date range filter if it exists
            createdAt: dateRange || undefined, // Add the date range filter if it exists
            isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined, // Simplified boolean check
        };

        try {
            const [resCount, resData] = await Promise.all([
                this.citiesRepository.count({ where }),
                query?.export
                    ? this.citiesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.citiesRepository.find({
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

    async findOne(id: number): Promise<City> {
        const relations = {
            state: true,
        };

        return await this.citiesRepository.findOne({ where: { id }, relations });
    }

    async update(
        id: number,
        updateCityDto: UpdateCityDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);
        const printer = await this.citiesRepository.findOneBy({ id });

        const updateCity = {
            ...printer,
            ...updateCityDto,
            name: updateCityDto.name.toUpperCase(),
            userUpdate: user,
        };

        try {
            await this.citiesRepository.save(updateCity);
            return '¡Ciudad editada con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateCity = await this.citiesRepository.findOneBy({ id });
        updateCity.isActive = !updateCity.isActive;

        try {
            await this.citiesRepository.save(updateCity);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listCities(query: any): Promise<City[]> {
        const options: any = { where: { isActive: true } };

        if (query.stateId) {
            options.relations = { state: true };
            options.where.state = { id: +query.stateId };
        }

        return await this.citiesRepository.find(options);
    }

    async getAllBanks(): Promise<City[]> {
        return this.citiesRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [{ header: 'Ciudades', key: 'name', width: 20 }];
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

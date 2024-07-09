import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Raw, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { ProfilePages } from './entities/profilePages.entity';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { ApplicationsService } from '../applications/applications.service';

@Injectable()
export class ProfilesService {
    constructor(
        private usersService: UsersService,
        private applicationsService: ApplicationsService,

        @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
        @InjectRepository(ProfilePages) private profilePagesRepository: Repository<ProfilePages>,
    ) {}

    async create(createProfileDto: CreateProfileDto, userId: number): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);
        const newProfile = new Profile();
        newProfile.name = createProfileDto.name.toUpperCase();
        newProfile.description = createProfileDto.description;
        newProfile.user = user;
        newProfile.userUpdate = user;
        try {
            const resultNewProfile = await this.profilesRepository.save(newProfile);
            for (const page of createProfileDto.pages) {
                if (page.active) {
                    for (const mod of page.modules) {
                        if (mod.active) {
                            let newProfilePages = new ProfilePages();
                            newProfilePages.profile = resultNewProfile;
                            newProfilePages.page = mod.id;
                            newProfilePages.package = mod.package;
                            await this.profilePagesRepository.save(newProfilePages);
                            for (const subPage of mod.pages) {
                                if (subPage.active) {
                                    let newSubProfilePages = new ProfilePages();
                                    newSubProfilePages.profile = resultNewProfile;
                                    newSubProfilePages.page = subPage.id;
                                    newSubProfilePages.package = subPage.packageId;
                                    await this.profilePagesRepository.save(newSubProfilePages);

                                    if (subPage.pages.length > 0) {
                                        for (const pageChild of subPage.pages) {
                                            if (pageChild.active) {
                                                let newSubProfilePages = new ProfilePages();
                                                newSubProfilePages.profile = resultNewProfile;
                                                newSubProfilePages.page = pageChild.id;
                                                newSubProfilePages.package = pageChild.packageId;
                                                await this.profilePagesRepository.save(
                                                    newSubProfilePages,
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return '¡Perfil creado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: Profile[] }> {
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
                this.profilesRepository.count({ where }),
                query?.export
                    ? this.profilesRepository.find({
                          relations,
                          where,
                          order: { id: order },
                      })
                    : this.profilesRepository.find({
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

    async findOne(id: number): Promise<Profile> {
        let profile = await this.profilesRepository.findOne({
            relations: {
                profilePages: {
                    profile: true,
                    page: true,
                    package: {
                        actions: true,
                    },
                },
            },
            where: {
                id: id,
            },
        });

        let pages = await this.applicationsService.findAllProfile();

        const data = await pages.data.map((el) => {
            el.active = false;
            el.modules.forEach((mod) => {
                profile.profilePages.forEach((pf) => {
                    mod.pages.forEach((pag) => {
                        if (pf.page.id === pag.id) {
                            el.active = true;
                            mod.active = true;
                            pag.active = true;
                            pag.packageId = pf.package.id;

                            if (pag.pages.length > 0) {
                                pag.pages.forEach((pagChild) => {
                                    let pagePackageProfileChild = profile.profilePages.find(
                                        (pg) => pg.page.id === pagChild.id,
                                    );

                                    if (pagePackageProfileChild) {
                                        pagChild.active = true;
                                        pagChild.packageId = pagePackageProfileChild.package.id;
                                    }
                                });
                            }
                        }
                    });
                });
            });

            return {
                ...el,
                active: el.active,
            };
        });

        let datProfile = { ...profile, pages: data };

        return datProfile;
    }

    async update(
        id: number,
        updateProfileDto: UpdateProfileDto,
        userId: number,
    ): Promise<string | Error> {
        const user = await this.usersService.findOne(userId);
        const updateProfile = await this.profilesRepository.findOneBy({ id });
        updateProfile.name = updateProfileDto.name.toUpperCase();
        updateProfile.description = updateProfileDto.description;
        updateProfile.user = user;
        updateProfile.userUpdate = user;
        try {
            const resultUpdateProfile = await this.profilesRepository.save(updateProfile);
            await this.profilePagesRepository.delete({ profile: resultUpdateProfile });

            for (const page of updateProfileDto.pages) {
                if (page.active) {
                    for (const mod of page.modules) {
                        if (mod.active) {
                            let newProfilePages = new ProfilePages();
                            newProfilePages.profile = updateProfile;
                            newProfilePages.page = mod.id;
                            newProfilePages.package = mod.package;
                            await this.profilePagesRepository.save(newProfilePages);
                            for (const subPage of mod.pages) {
                                if (subPage.active) {
                                    let newSubProfilePages = new ProfilePages();
                                    newSubProfilePages.profile = updateProfile;
                                    newSubProfilePages.page = subPage.id;
                                    newSubProfilePages.package = subPage.packageId;
                                    await this.profilePagesRepository.save(newSubProfilePages);

                                    if (subPage.pages.length > 0) {
                                        for (const pageChild of subPage.pages) {
                                            if (pageChild.active) {
                                                let newSubProfilePages = new ProfilePages();
                                                newSubProfilePages.profile = updateProfile;
                                                newSubProfilePages.page = pageChild.id;
                                                newSubProfilePages.package = pageChild.packageId;
                                                await this.profilePagesRepository.save(
                                                    newSubProfilePages,
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return '¡Perfil editado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateProfile = await this.profilesRepository.findOneBy({ id });
        updateProfile.isActive = !updateProfile.isActive;
        try {
            await this.profilesRepository.save(updateProfile);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async listProfiles(): Promise<Profile[]> {
        return await this.profilesRepository.find({ where: { isActive: true } });
    }

    async getAllBanks(): Promise<Profile[]> {
        return this.profilesRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Perfiles', key: 'name', width: 20 },
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

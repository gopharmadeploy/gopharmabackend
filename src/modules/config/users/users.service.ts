import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Between, Like, Raw, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
// import { ProfilesService } from 'src/profiles/profiles.service';
import { MailsService } from 'src/mails/mails.service';
// import e from 'express';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        //private profileService: ProfilesService,
        @Inject(forwardRef(() => MailsService)) // Usa forwardRef aquí
        private readonly mailService: MailsService,
    ) { }

    async create(createUserDto: CreateUserDto, filePath?: string): Promise<string | Error> {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

        //console.log('body de la peticion desde users.service', createUserDto);

        const user = await this.findByEmail(createUserDto);
        const userWithDni = await this.findByDni(createUserDto);
        if (user || userWithDni) {
            throw new HttpException('Ese correo o DNI ya se encuentra registrado', 401);
        }

        try {
            await this.usersRepository.save({
                ...createUserDto,
                password: hashedPassword,
                filePath,
            });
            const mailResponse = await this.mailService.create(createUserDto);
            console.log('email response desde createUser:', mailResponse);
            return '¡Usuario creado con éxito!';
        } catch (error) {
            console.log('entré en el error');
            throw error;
        }
    }

    async findAll(query: any): Promise<{ totalRows: number; data: User[] }> {
        const take = query.rows || 5;
        const skip = query.page ? (query.page - 1) * take : 0;
        const order = query.order || 'DESC';
    
        const where = this.buildWhereClause(query);
   
        try {
            const [resCount, resData] = await Promise.all([
                
                this.usersRepository.count({ where, relations: ['profile'] }),
                query?.export
                    ? this.usersRepository.find({
                          where,
                          order: { id: order },
                          relations: ['profile'],
                      })
                    : this.usersRepository.find({
                          where,
                          order: { id: order },
                          take,
                          skip,
                          relations: ['profile'],
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


    private buildWhereClause(query: any) {
        const where: any = {};

        // Filtro por estado activo
        if (query.isActive !== undefined) {
            where.isActive = query.isActive === 'true';
        }

        // Filtro por nombre de perfil

        if (query.profile) {
            where.profile = {
                name: Raw(alias => `${alias} LIKE '%${query.profile}%'`),
            };
        }
        // Filtro por nombre de usuario
        if (query.name) {
            where.name = Raw(alias => `${alias} LIKE '%${query.name}%'`);
        }

        // Filtro por correo
        if (query.email) {
            where.email = Raw(email => `email LIKE '%${query.email}%'`);
        }

        // Filtro por rango de fechas en createdAt
        if (query.createdAt) {
            const [startDate, endDate] = query.createdAt.split(',');
            where.createdAt = Raw(createdAt => `${createdAt} BETWEEN '${new Date(startDate).toISOString()}' AND '${new Date(endDate).toISOString()}'`);
        }

        // Filtro por rango de fechas en updatedAt
        if (query.updatedAt) {
            const [startDate, endDate] = query.updatedAt.split(',');
            where.updatedAt = Raw(updatedAt => `${updatedAt} BETWEEN '${new Date(startDate).toISOString()}' AND '${new Date(endDate).toISOString()}'`);
        }

        return where;
    }

    async findOne(id: number): Promise<User> {
        return await this.usersRepository.findOne({
            where: { id },
            relations: ['profile'],
        });
    }

    async findByUsername(username: string): Promise<User> {
        return await this.usersRepository.findOne({
            relations: {
                applications: true,
                profile: {
                    profilePages: {
                        page: true,
                        package: {
                            actions: true,
                        },
                    },
                },
            },
            where: {
                email: username,
            },
        });
    }

    async findByEmail(body: any): Promise<User> {
        const email = body.email;
        console.log('email to search:', email);
        const user = await this.usersRepository.findOne({
            relations: ['profile'],
            where: {
                email: email,
            },
        });
        console.log(user);
        return user;
    }

    async findByDni(body: any): Promise<User> {
        const dni = body.dni;
        console.log('dni to search:', dni);
        const user = await this.usersRepository.findOne({
            relations: ['profile'],
            where: {
                dni: dni,
            },
        });
        console.log(user);
        return user;
    }

    async findByAdminProfile(): Promise<User[]> {
        return await this.usersRepository.find({
            where: {
                profile: {
                    name: 'Administrador',
                },
            },
            relations: ['profile'],
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<string | Error> {
        //console.log('ACTUALIZANDO');
        //console.log('id a actualizar', id);
        //console.log('info nueva para actualizar', updateUserDto);

        const updateUser = await this.usersRepository.findOne({
            relations: ['profile'],
            where: {
                id: id,
            },
        });

        console.log('USER TO UPDATE', updateUser);

        updateUser.name = updateUserDto.name;
        updateUser.fullName = updateUserDto.fullName;
        updateUser.email = updateUserDto.email;
        updateUser.profile = updateUserDto['profile'];
        updateUser.phoneNumber = updateUserDto.phoneNumber;
        updateUser.dni = updateUserDto.dni;

        try {
            await this.usersRepository.save(updateUser);
            const mailResponse = await this.mailService.create(updateUser);
            console.log('email response:', mailResponse);
            return '¡Usuario actualizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async changeStatus(id: number): Promise<string | Error> {
        const updateUser = await this.usersRepository.findOneBy({ id });
        updateUser.isActive = !updateUser.isActive;

        try {
            await this.usersRepository.save(updateUser);
            return '¡Cambio de estatus realizado con éxito!';
        } catch (error) {
            throw error;
        }
    }

    async saveFilePath(filePath: string): Promise<User> {
        const newUserImage = this.usersRepository.create({ filePath });
        return await this.usersRepository.save(newUserImage);
    }

    async updateTokeAndExpiration(user: User): Promise<any | Error> {
        //se llama al enviarse el correo de peticion de reinicio de contraseña sendResetPassMail

        console.log('user desde el servicio de users', user);
        try {
            return await this.usersRepository.save(user);
        } catch (error) {
            throw error;
        }
    }

    async updatePassword(id: number, password: string): Promise<string | Error> {
        //se llama en la url que llega en el correo enviado en el mail service
        const now = new Date();

        try {
            const userToUpdatePassword = await this.usersRepository.findOneBy({ id });

            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);

            userToUpdatePassword.password = hashedPassword;
            userToUpdatePassword.resetToken = '';
            userToUpdatePassword.resetTokenExpiration = new Date(now.getTime());
            await this.usersRepository.save(userToUpdatePassword);

            const emailToNotifyResponse = await this.mailService.notifyPasswordChanged(
                userToUpdatePassword.email,
                userToUpdatePassword.fullName,
            );
            console.log(emailToNotifyResponse);
        } catch (error) {
            throw error;
        }

        return 'Contraseña actualizada con éxito!';
    }

    async getAllBanks(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async exportDataToExcel(data: any[], res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.addRow(['Reporte de Datos']);
        worksheet.columns = [
            { header: 'Usuario', key: 'name', width: 20 },
            { header: 'Correo electronico', key: 'email', width: 20 },
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

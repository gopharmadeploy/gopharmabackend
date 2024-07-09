import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { UpdateMailDto } from './dto/update-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailDto } from './dto/create-mail.dto';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/modules/config/users/users.service';
import { User } from 'src/modules/config/users/entities/user.entity';
import { SocketGateway } from 'src/socket/socket/socket.gateway';

@Injectable()
export class MailsService {
    private readonly jwtSecret = 'your-secret-key'; // Cambia esto a tu clave secreta
    private readonly tokenExpiration = '1h'; // Tiempo de expiración del token

    constructor(
        private readonly mailerService: MailerService,
        @Inject(forwardRef(() => UsersService)) // Usa forwardRef aquí
        private readonly usersService: UsersService,
        private readonly socketGateway: SocketGateway
    ) { }

    async create(userInfo: SendMailDto) {
        console.log('info desde el mail service:', userInfo);

        var subject = userInfo.id ? 'editado' : 'creado';

        const response = await this.mailerService.sendMail({
            to: userInfo.email,
            from: 'gopharmapruebas1@gmail.com',
            subject: `¡Usuario ${subject} con éxito!`,
            template: `./${subject}`, // nombre del template (p.ej. confirmation.hbs)
            context: {
                // datos que serán pasados al template
                fullName: userInfo.fullName,
                name: userInfo.name,
                email: userInfo.email,
                phoneNumber: userInfo.phoneNumber,
                dni: userInfo.dni,
                subject: subject,
                password: userInfo.password,
            },
        });

        return response;
    }

    private generateResetToken(user: User): string {
        const payload = { userId: user.id, email: user.email };
        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiration });
    }

    async sendResetPassMailByEmail(email: any) {
        const foundedUser = await this.usersService.findByEmail(email);

        if (!foundedUser) {
            throw new HttpException('Ese correo electrónico no se encuentra registrado', 404);
        }

        console.log('FOUNDED USER DESDE MAIL SERVICE BY MEAIL', foundedUser);
        const res = await this.sendResetPassMail(foundedUser);
        return res;
    }

    async sendResetPassMail(userId: any) {
        //extrae id
        console.log(userId, ' desde el servicio');

        const idToUpdate = userId.userId || userId.id;

        console.log(idToUpdate);

        //extrae el usuario a actualizar
        const user = await this.usersService.findOne(idToUpdate);
        console.log('user en mail service', user);

        //generar token
        const token = this.generateResetToken(user);
        const now = new Date();

        console.log(token);

        //establezco el resetToken y su expirationDate
        user.resetToken = token;
        user.resetTokenExpiration = new Date(now.getTime() + 60 * 60 * 1000);

        //guardo esos valores
        try {
            const res = await this.usersService.updateTokeAndExpiration(user);
            console.log(res);
        } catch (error) {
            throw error;
        }

        //despues genero el url
        const url =
            'http://' +
            process.env.DB_HOST +
            ':' +
            process.env.FRONTEND_PORT +
            '/reset_password?token=' +
            token +
            '&id=' +
            user.id;
        console.log(url);

        const response = await this.mailerService.sendMail({
            to: user.email,
            from: 'gopharmapruebas1@gmail.com',
            subject: `Solicitud de reinicio de contraseña`,
            template: `./passwordReset`,
            context: {
                fullName: user.fullName,
                url: url,
            },
        });

        console.log(response);
        return '¡Solicitud de cambio de contraseña enviada!';
    }

    async notifyPasswordChanged(email: string, fullName: string) {
        const urlToLogin =
            'http://' + process.env.DB_HOST + ':' + process.env.FRONTEND_PORT + '/login';

        const response = await this.mailerService.sendMail({
            to: email,
            from: 'gopharmapruebas1@gmail.com',
            subject: `Cambio de contraseña`,
            template: `./passwordChanged`,
            context: {
                fullName: fullName,
                url: urlToLogin,
            },
        });

        return response;
    }

    async sendExchangeRateChangeToAdmin(reason: string, currency?: string, rate?: string) {
        const now = new Date();
        const admins = await this.usersService.findByAdminProfile();
        //console.log(admins)
        const actualTime = this.formatDate(now); // Llama a la función de formato


        admins.forEach(async (admin) => {
            const { email, fullName } = admin;

            if (reason == 'SUCCESS') {

                try {
                    await this.mailerService.sendMail({
                        to: email,
                        from: 'gopharmapruebas1@gmail.com',
                        subject: '✅¡La tasa se actualizó con éxito!',
                        template: `./exchangeRateChangedSucceed`,
                        context: {
                            fullName: fullName,
                            reason: reason,
                            rate: rate,
                            date: actualTime,
                            currency: currency,
                        },
                    });
                } catch (error) {
                    console.log("El error enviando correo",error)
                   //envio al socket 

                   this.socketGateway.server.emit("failedwhensendingemail",email)
                }


            } else if (reason == 'FAILED503') {

                try {
                    await this.mailerService.sendMail({
                        to: email,
                        from: 'gopharmapruebas1@gmail.com',
                        subject: '🛑No se pudo verificar si la tasa está actualizada',
                        template: `./exchangeRateError503`,
                        context: {
                            date: actualTime,
                        },
                    });
                } catch (error) {
                   console.log("El error enviando correo",error)
                   //envio al socket 

                   this.socketGateway.server.emit("failedwhensendingemail",email)
                
                }

            } else if (reason == 'FAILED500') {

                try {
                    await this.mailerService.sendMail({
                        to: email,
                        from: 'gopharmapruebas1@gmail.com',
                        subject: '🛑No se pudo verificar si la tasa está actualizada',
                        template: `./exchangeRateError500`,
                        context: {
                            date: actualTime,
                        },
                    });
                } catch (error) {
                    console.log("El error enviando correo",error)
                   //envio al socket 

                   this.socketGateway.server.emit("failedwhensendingemail",email)
                }

               
            } else if (reason == 'FAILEDWITHCURRENCY') {

                try {
                    await this.mailerService.sendMail({
                        to: email,
                        from: 'gopharmapruebas1@gmail.com',
                        subject:
                            '🛑No se pudo verificar si se encuentra actualizada la tasa de ' + currency,
                        template: `./exchangeRateErrorCurrency`,
                        context: {
                            date: actualTime,
                            currency: currency,
                        },
                    });
                } catch (error) {
                    console.log("El error enviando correo",error)
                    //envio al socket 
 
                    this.socketGateway.server.emit("failedwhensendingemail",email)
                }

               
            }
        });


    }

    findAll() {
        return `This action returns all mails`;
    }

    findOne(id: number) {
        return `This action returns a #${id} mail`;
    }

    update(id: number, updateMailDto: UpdateMailDto) {
        return `This action updates a #${id} mail`;
    }

    remove(id: number) {
        return `This action removes a #${id} mail`;
    }

    private formatDate(date: Date): string {
        const day = date.getDate();
        const month = date.getMonth() + 1; // Los meses empiezan en 0
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // Formatea cada parte para que tenga dos dígitos
        const dayString = day < 10 ? '0' + day : day.toString();
        const monthString = month < 10 ? '0' + month : month.toString();
        const hoursString = hours < 10 ? '0' + hours : hours.toString();
        const minutesString = minutes < 10 ? '0' + minutes : minutes.toString();
        const secondsString = seconds < 10 ? '0' + seconds : seconds.toString();

        // Construye la cadena de fecha y hora
        return `${dayString}/${monthString}/${year} ${hoursString}:${minutesString}:${secondsString}`;
    }
}

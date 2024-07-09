import { Module, forwardRef } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { UsersModule } from 'src/modules/config/users/users.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
    imports: [
        MailerModule.forRoot({
            transport: {
                host: 'smtp.gmail.com', // Servidor saliente SMTP
                port: 465, // Puerto SMTP seguro (SSL/TLS)
                secure: true, // true para SSL/TLS
                auth: {
                    user: 'gopharmapruebas1@gmail.com', // Tu nombre de usuario de correo electrónico
                    pass: 'tjpr kxrf otsc fvns', // Tu contraseña de correo electrónico
                },
            },
            template: {
                dir: join(__dirname, '../../src/templates'),
                adapter: new HandlebarsAdapter(), // o el adaptador que prefieras
                options: {
                    strict: true,
                },
            },
            options: {
                debug: true, // Habilitar debug
                logger: true, // Habilitar logger
            },
        }),
        forwardRef(() => UsersModule),
        SocketModule
    ],
    controllers: [MailsController],
    providers: [MailsService],
    exports: [MailsService],
})
export class MailsModule {}

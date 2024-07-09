import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

config();

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
        origin: 'http://localhost:3001', // URL de tu frontend
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useStaticAssets('uploads', {
        prefix: '/uploads/',
    });

    configSwagger(app);
    await app.listen(process.env.SERVER_PORT);
}

bootstrap();

const configSwagger = (app) => {
    const config = new DocumentBuilder()
        .setTitle('Documentación Backend PosPharma')
        .setDescription(
            'Este es el proyecto para el sistema pos de la farmacias aliadas a GoPharma',
        )
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('actions')
        .addTag('applications')
        .addTag('auth')
        .addTag('cashier_types')
        .addTag('cashiers')
        .addTag('cities')
        .addTag('companies')
        .addTag('printer_brands')
        .addTag('printer_models')
        .addTag('printer_types')
        .addTag('printers')
        .addTag('profiles')
        .addTag('states')
        .addTag('status')
        .addTag('users')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
};

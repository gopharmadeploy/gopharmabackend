import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Page } from '../pages/entities/page.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Application, Page]), UsersModule],
    controllers: [ApplicationsController],
    providers: [ApplicationsService],
    exports: [ApplicationsService],
})
export class ApplicationsModule {}

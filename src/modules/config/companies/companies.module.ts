import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Company]),
        MulterModule.register({ dest: './uploads' }),
        UsersModule,
    ],
    controllers: [CompaniesController],
    providers: [CompaniesService],
})
export class CompaniesModule {}

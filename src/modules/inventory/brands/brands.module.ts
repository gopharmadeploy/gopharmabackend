import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand } from './entities/brand.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Brand]), UsersModule],
    controllers: [BrandsController],
    providers: [BrandsService],
})
export class BrandsModule {}

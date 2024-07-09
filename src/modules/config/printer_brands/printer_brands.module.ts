import { Module } from '@nestjs/common';
import { PrinterBrandsService } from './printer_brands.service';
import { PrinterBrandsController } from './printer_brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterBrand } from './entities/printer_brand.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([PrinterBrand]), UsersModule],
    controllers: [PrinterBrandsController],
    providers: [PrinterBrandsService],
})
export class PrinterBrandsModule {}

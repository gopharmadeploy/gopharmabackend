import { Module } from '@nestjs/common';
import { PrinterTypesService } from './printer_types.service';
import { PrinterTypesController } from './printer_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterType } from './entities/printer_type.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([PrinterType]), UsersModule],
    controllers: [PrinterTypesController],
    providers: [PrinterTypesService],
})
export class PrinterTypesModule {}

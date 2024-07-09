import { Module } from '@nestjs/common';
import { PrinterModelsService } from './printer_models.service';
import { PrinterModelsController } from './printer_models.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterModel } from './entities/printer_model.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([PrinterModel]), UsersModule],
    controllers: [PrinterModelsController],
    providers: [PrinterModelsService],
})
export class PrinterModelsModule {}

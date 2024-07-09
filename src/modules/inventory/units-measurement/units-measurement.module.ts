import { Module } from '@nestjs/common';
import { UnitsMeasurementService } from './units-measurement.service';
import { UnitsMeasurementController } from './units-measurement.controller';
import { UnitsMeasurement } from './entities/units-measurement.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([UnitsMeasurement]), UsersModule],
    controllers: [UnitsMeasurementController],
    providers: [UnitsMeasurementService],
    exports: [UnitsMeasurementService],
})
export class UnitsMeasurementModule {}

import { PartialType } from '@nestjs/swagger';
import { CreateUnitsMeasurementDto } from './create-units-measurement.dto';

export class UpdateUnitsMeasurementDto extends PartialType(CreateUnitsMeasurementDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateUnitsConcentrationDto } from './create-units-concentration.dto';

export class UpdateUnitsConcentrationDto extends PartialType(CreateUnitsConcentrationDto) {}

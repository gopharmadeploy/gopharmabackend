import { PartialType } from '@nestjs/swagger';
import { CreateConcentrationDto } from './create-concentration.dto';

export class UpdateConcentrationDto extends PartialType(CreateConcentrationDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateCityDto } from './create-cities.dto';

export class UpdateCityDto extends PartialType(CreateCityDto) {}

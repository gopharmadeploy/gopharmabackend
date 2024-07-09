import { PartialType } from '@nestjs/mapped-types';
import { CreateCashierDto } from './create-cashiers.dto';

export class UpdateCashierDto extends PartialType(CreateCashierDto) {}

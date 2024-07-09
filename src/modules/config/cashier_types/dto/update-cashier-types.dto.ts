import { PartialType } from '@nestjs/mapped-types';
import { CreateCashierTypeDto } from './create-cashier-types.dto';

export class UpdateCashierTypeDto extends PartialType(CreateCashierTypeDto) {}

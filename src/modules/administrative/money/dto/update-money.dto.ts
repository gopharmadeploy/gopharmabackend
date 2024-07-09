import { PartialType } from '@nestjs/swagger';
import { CreateMoneyDto } from './create-money.dto';

export class UpdateMoneyDto extends PartialType(CreateMoneyDto) {}

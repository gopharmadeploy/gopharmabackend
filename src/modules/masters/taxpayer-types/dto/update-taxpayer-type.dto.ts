import { PartialType } from '@nestjs/swagger';
import { CreateTaxpayerTypeDto } from './create-taxpayer-type.dto';

export class UpdateTaxpayerTypeDto extends PartialType(CreateTaxpayerTypeDto) {}

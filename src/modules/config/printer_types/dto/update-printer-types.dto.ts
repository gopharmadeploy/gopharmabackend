import { PartialType } from '@nestjs/mapped-types';
import { CreatePrinterTypeDto } from './create-printer-types.dto';

export class UpdatePrinterTypeDto extends PartialType(CreatePrinterTypeDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreatePrinterModelDto } from './create-printer-models.dto';

export class UpdatePrinterModelDto extends PartialType(CreatePrinterModelDto) {}

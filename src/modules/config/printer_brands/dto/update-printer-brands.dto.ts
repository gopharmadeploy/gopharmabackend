import { PartialType } from '@nestjs/mapped-types';
import { CreatePrinterBrandDto } from './create-printer-brands.dto';

export class UpdatePrinterBrandDto extends PartialType(CreatePrinterBrandDto) {}

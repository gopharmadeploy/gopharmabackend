import { PartialType } from '@nestjs/mapped-types';
import { CreatePrinterDto } from './create-printers.dto';

export class UpdatePrinterDto extends PartialType(CreatePrinterDto) {}

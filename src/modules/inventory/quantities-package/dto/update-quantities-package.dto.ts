import { PartialType } from '@nestjs/swagger';
import { CreateQuantitiesPackageDto } from './create-quantities-package.dto';

export class UpdateQuantitiesPackageDto extends PartialType(CreateQuantitiesPackageDto) {}

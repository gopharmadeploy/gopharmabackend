import { PartialType } from '@nestjs/swagger';
import { CreateTypesPackagingDto } from './create-types-packaging.dto';

export class UpdateTypesPackagingDto extends PartialType(CreateTypesPackagingDto) {}

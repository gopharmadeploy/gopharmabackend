import { PartialType } from '@nestjs/swagger';
import { CreateIdentificationTypeDto } from './create-identification-type.dto';

export class UpdateIdentificationTypeDto extends PartialType(CreateIdentificationTypeDto) {}

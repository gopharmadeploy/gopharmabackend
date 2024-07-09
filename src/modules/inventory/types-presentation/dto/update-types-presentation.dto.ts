import { PartialType } from '@nestjs/swagger';
import { CreateTypesPresentationDto } from './create-types-presentation.dto';

export class UpdateTypesPresentationDto extends PartialType(CreateTypesPresentationDto) {}

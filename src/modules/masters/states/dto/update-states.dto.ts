import { PartialType } from '@nestjs/mapped-types';
import { CreateStateDto } from './create-states.dto';

export class UpdateStateDto extends PartialType(CreateStateDto) {}

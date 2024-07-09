import { PartialType } from '@nestjs/swagger';
import { CreateScrappingServiceDto } from './create-scrapping_service.dto';

export class UpdateScrappingServiceDto extends PartialType(CreateScrappingServiceDto) {}

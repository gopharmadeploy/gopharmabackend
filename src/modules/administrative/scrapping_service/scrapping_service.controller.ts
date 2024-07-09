import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScrappingServiceService } from './scrapping_service.service';
import { CreateScrappingServiceDto } from './dto/create-scrapping_service.dto';
import { UpdateScrappingServiceDto } from './dto/update-scrapping_service.dto';

@Controller('scrapping-service')
export class ScrappingServiceController {
  constructor(private readonly scrappingServiceService: ScrappingServiceService) {}


}

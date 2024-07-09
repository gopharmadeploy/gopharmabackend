import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Request,
    Res,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-cities.dto';
import { UpdateCityDto } from './dto/update-cities.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.citiesService.findAll(query);
        await this.citiesService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createCityDto: CreateCityDto, @Request() req: any) {
        return this.citiesService.create(createCityDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.citiesService.findAll(query);
    }

    @Get('list')
    listCities(@Query() query: any) {
        return this.citiesService.listCities(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.citiesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCityDto: UpdateCityDto,
        @Request() req: any,
    ) {
        return this.citiesService.update(id, updateCityDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.citiesService.changeStatus(id);
    }
}

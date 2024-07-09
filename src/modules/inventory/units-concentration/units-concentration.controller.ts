import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Res,
    Delete,
    Request,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { UnitsConcentrationService } from './units-concentration.service';
import { CreateUnitsConcentrationDto } from './dto/create-units-concentration.dto';
import { UpdateUnitsConcentrationDto } from './dto/update-units-concentration.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('inventory/units-concentration')
export class UnitsConcentrationController {
    constructor(private readonly unitsConcentrationService: UnitsConcentrationService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.unitsConcentrationService.findAll(query);
        await this.unitsConcentrationService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createUnitsConcentrationDto: CreateUnitsConcentrationDto, @Request() req: any) {
        return this.unitsConcentrationService.create(createUnitsConcentrationDto, req.user.sub);
    }

    @Get('list')
    listUnistConcentration() {
        return this.unitsConcentrationService.listUnistConcentration();
    }

    @Get()
    findAll(@Query() query: any) {
        return this.unitsConcentrationService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.unitsConcentrationService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateUnitsConcentrationDto: UpdateUnitsConcentrationDto,
    ) {
        return this.unitsConcentrationService.update(+id, updateUnitsConcentrationDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.unitsConcentrationService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.unitsConcentrationService.changeStatus(id);
    }
}

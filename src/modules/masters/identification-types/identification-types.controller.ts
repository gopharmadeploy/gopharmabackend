import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
    Query,
    ParseIntPipe,
    Request,
} from '@nestjs/common';
import { IdentificationTypesService } from './identification-types.service';
import { CreateIdentificationTypeDto } from './dto/create-identification-type.dto';
import { UpdateIdentificationTypeDto } from './dto/update-identification-type.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('identification_types')
export class IdentificationTypesController {
    constructor(private readonly identificationTypesService: IdentificationTypesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.identificationTypesService.findAll(query);
        await this.identificationTypesService.exportDataToExcel(data.data, res);
    }
    @Post()
    create(@Body() createIdentificationTypeDto: CreateIdentificationTypeDto, @Request() req: any) {
        return this.identificationTypesService.create(createIdentificationTypeDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.identificationTypesService.findAll(query);
    }

    @Get('list')
    listIdentificationTypes() {
        return this.identificationTypesService.listIdentificationTypes();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.identificationTypesService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateIdentificationTypeDto: UpdateIdentificationTypeDto,
    ) {
        return this.identificationTypesService.update(+id, updateIdentificationTypeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.identificationTypesService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.identificationTypesService.changeStatus(id);
    }
}

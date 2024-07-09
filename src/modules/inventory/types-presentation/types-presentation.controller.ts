import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Res,
    Request,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { TypesPresentationService } from './types-presentation.service';
import { CreateTypesPresentationDto } from './dto/create-types-presentation.dto';
import { UpdateTypesPresentationDto } from './dto/update-types-presentation.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('inventory/types-presentation')
export class TypesPresentationController {
    constructor(private readonly typesPresentationService: TypesPresentationService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.typesPresentationService.findAll(query);
        await this.typesPresentationService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createTypesPresentationDto: CreateTypesPresentationDto, @Request() req: any) {
        return this.typesPresentationService.create(createTypesPresentationDto, req.user.sub);
    }

    @Get('list')
    listTypesPresentationService() {
        return this.typesPresentationService.listTypesPresentationService();
    }

    @Get()
    findAll(@Query() query: any) {
        return this.typesPresentationService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.typesPresentationService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateTypesPresentationDto: UpdateTypesPresentationDto,
    ) {
        return this.typesPresentationService.update(+id, updateTypesPresentationDto);
    }

    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //     return this.typesPresentationService.remove(+id);
    // }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.typesPresentationService.changeStatus(id);
    }
}

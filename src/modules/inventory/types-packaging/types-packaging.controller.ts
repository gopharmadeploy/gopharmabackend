import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
    Request,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { TypesPackagingService } from './types-packaging.service';
import { CreateTypesPackagingDto } from './dto/create-types-packaging.dto';
import { UpdateTypesPackagingDto } from './dto/update-types-packaging.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('inventory/types-packaging')
export class TypesPackagingController {
    constructor(private readonly typesPackagingService: TypesPackagingService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.typesPackagingService.findAll(query);
        await this.typesPackagingService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createTypesPackagingDto: CreateTypesPackagingDto, @Request() req: any) {
        return this.typesPackagingService.create(createTypesPackagingDto, req.user.sub);
    }

    @Get('list')
    listTypesPackaging() {
        return this.typesPackagingService.listTypesPackaging();
    }

    @Get()
    findAll(@Query() query: any) {
        return this.typesPackagingService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.typesPackagingService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTypesPackagingDto: UpdateTypesPackagingDto) {
        return this.typesPackagingService.update(+id, updateTypesPackagingDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.typesPackagingService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.typesPackagingService.changeStatus(id);
    }
}

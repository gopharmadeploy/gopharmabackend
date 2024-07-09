import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Request,
    Query,
    Res,
    ParseIntPipe,
} from '@nestjs/common';
import { TaxpayerTypesService } from './taxpayer-types.service';
import { CreateTaxpayerTypeDto } from './dto/create-taxpayer-type.dto';
import { UpdateTaxpayerTypeDto } from './dto/update-taxpayer-type.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('taxpayer_types')
export class TaxpayerTypesController {
    constructor(private readonly taxpayerTypesService: TaxpayerTypesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.taxpayerTypesService.findAll(query);
        await this.taxpayerTypesService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createTaxpayerTypeDto: CreateTaxpayerTypeDto, @Request() req: any) {
        return this.taxpayerTypesService.create(createTaxpayerTypeDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.taxpayerTypesService.findAll(query);
    }

    @Get('list')
    listTaxpayerTypes() {
        return this.taxpayerTypesService.listTaxpayerTypes();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.taxpayerTypesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaxpayerTypeDto: UpdateTaxpayerTypeDto) {
        return this.taxpayerTypesService.update(+id, updateTaxpayerTypeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.taxpayerTypesService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.taxpayerTypesService.changeStatus(id);
    }
}

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Request,
    Query,
    Res,
    ParseIntPipe,
} from '@nestjs/common';
import { PrinterBrandsService } from './printer_brands.service';
import { CreatePrinterBrandDto } from './dto/create-printer-brands.dto';
import { UpdatePrinterBrandDto } from './dto/update-printer-brands.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('printer_brands')
@Controller('printer_brands')
export class PrinterBrandsController {
    constructor(private readonly printerBrandsService: PrinterBrandsService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.printerBrandsService.findAll(query);
        await this.printerBrandsService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createPrinterBrandDto: CreatePrinterBrandDto, @Request() req: any) {
        return this.printerBrandsService.create(createPrinterBrandDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.printerBrandsService.findAll(query);
    }

    @Get('list')
    listPrinterBrands() {
        return this.printerBrandsService.listPrinterBrands();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.printerBrandsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePrinterBrandDto: UpdatePrinterBrandDto,
        @Request() req: any,
    ) {
        return this.printerBrandsService.update(id, updatePrinterBrandDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.printerBrandsService.changeStatus(id);
    }
}

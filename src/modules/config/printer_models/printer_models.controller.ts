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
import { PrinterModelsService } from './printer_models.service';
import { CreatePrinterModelDto } from './dto/create-printer-models.dto';
import { UpdatePrinterModelDto } from './dto/update-printer-models.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('printer_models')
@Controller('printer_models')
export class PrinterModelsController {
    constructor(private readonly printerModelsService: PrinterModelsService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.printerModelsService.findAll(query);
        await this.printerModelsService.exportDataToExcel(data.data, res);
    }
    @Post()
    create(@Body() createPrinterModelDto: CreatePrinterModelDto, @Request() req: any) {
        return this.printerModelsService.create(createPrinterModelDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.printerModelsService.findAll(query);
    }

    @Get('list')
    listPrinterModels(@Query() query: any) {
        return this.printerModelsService.listPrinterModels(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.printerModelsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePrinterModelDto: UpdatePrinterModelDto,
        @Request() req: any,
    ) {
        return this.printerModelsService.update(id, updatePrinterModelDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.printerModelsService.changeStatus(id);
    }
}

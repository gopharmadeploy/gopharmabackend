import {
    Controller,
    Get,
    Post,
    Body,
    Res,
    Patch,
    Param,
    Request,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { PrinterTypesService } from './printer_types.service';
import { CreatePrinterTypeDto } from './dto/create-printer-types.dto';
import { UpdatePrinterTypeDto } from './dto/update-printer-types.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('printer_types')
@Controller('printer_types')
export class PrinterTypesController {
    constructor(private readonly printerTypesService: PrinterTypesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.printerTypesService.findAll(query);
        await this.printerTypesService.exportDataToExcel(data.data, res);
    }
    @Post()
    create(@Body() createPrinterTypeDto: CreatePrinterTypeDto, @Request() req: any) {
        return this.printerTypesService.create(createPrinterTypeDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.printerTypesService.findAll(query);
    }

    @Get('list')
    listPrinterTypes() {
        return this.printerTypesService.listPrinterTypes();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.printerTypesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePrinterTypeDto: UpdatePrinterTypeDto,
        @Request() req: any,
    ) {
        return this.printerTypesService.update(id, updatePrinterTypeDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.printerTypesService.changeStatus(id);
    }
}

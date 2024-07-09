import {
    Controller,
    Get,
    Post,
    Res,
    Body,
    Patch,
    Param,
    Request,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { PrintersService } from './printers.service';
import { CreatePrinterDto } from './dto/create-printers.dto';
import { UpdatePrinterDto } from './dto/update-printers.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('printers')
@Controller('printers')
export class PrintersController {
    constructor(private readonly printersService: PrintersService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.printersService.findAll(query);
        await this.printersService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createPrinterDto: CreatePrinterDto, @Request() req: any) {
        return this.printersService.create(createPrinterDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.printersService.findAll(query);
    }

    @Get('list')
    listPrinters() {
        return this.printersService.listPrinters();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.printersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePrinterDto: UpdatePrinterDto,
        @Request() req: any,
    ) {
        return this.printersService.update(id, updatePrinterDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.printersService.changeStatus(id);
    }
}

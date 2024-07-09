import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    ParseIntPipe,
    Res,
} from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('administrative/banks')
export class BanksController {
    constructor(private readonly banksService: BanksService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.banksService.findAll(query);
        await this.banksService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createBankDto: CreateBankDto) {
        return this.banksService.create(createBankDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.banksService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.banksService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
        return this.banksService.update(+id, updateBankDto);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.banksService.changeStatus(id);
    }
}

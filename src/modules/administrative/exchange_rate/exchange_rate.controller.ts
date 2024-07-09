import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Request,
    Query,
    ParseIntPipe,
    Res,
} from '@nestjs/common';
import { ExchangeRateService } from './exchange_rate.service';
import { CreateExchangeRateDto } from './dto/create-exchange_rate.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('administrative/exchange_rate')
export class ExchangeRateController {
    constructor(private readonly exchangeRateService: ExchangeRateService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
      query.export = 1;
      const data: any = await this.exchangeRateService.findAll(query);
      console.log('Exporting data:', data);
      await this.exchangeRateService.exportDataToExcel(data.data, res);
    }
    
    @Get("/actual_rates")
    findActiveExchangeRates(@Query() query: any) {
        //console.log("llegó")
        return this.exchangeRateService.findActiveExchangeRates();
    }

    @Post()
    create(@Body() createExchangeRateDto: CreateExchangeRateDto, @Request() req: any) {
        //console.log('exchange rate en el backend', createExchangeRateDto);
        return this.exchangeRateService.create(createExchangeRateDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.exchangeRateService.findAll(query);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.exchangeRateService.changeStatus(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.exchangeRateService.findOne(+id);
    }


    


}

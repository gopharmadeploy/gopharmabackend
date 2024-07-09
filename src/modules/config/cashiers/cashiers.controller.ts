import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Request,
    Res,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { CashiersService } from './cashiers.service';
import { CreateCashierDto } from './dto/create-cashiers.dto';
import { UpdateCashierDto } from './dto/update-cashiers.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('cashiers')
@Controller('cashiers')
export class CashiersController {
    constructor(private readonly cashiersService: CashiersService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        const data: any = await this.cashiersService.findAll(query);
        await this.cashiersService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createCashierDto: CreateCashierDto, @Request() req: any) {
        return this.cashiersService.create(createCashierDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.cashiersService.findAll(query);
    }

    @Get('list')
    listCashiers() {
        return this.cashiersService.listCashiers();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.cashiersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCashierDto: UpdateCashierDto,
        @Request() req: any,
    ) {
        return this.cashiersService.update(id, updateCashierDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.cashiersService.changeStatus(id);
    }
}

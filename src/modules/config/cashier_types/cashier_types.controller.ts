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
import { CashierTypesService } from './cashier_types.service';
import { CreateCashierTypeDto } from './dto/create-cashier-types.dto';
import { UpdateCashierTypeDto } from './dto/update-cashier-types.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('cashier_types')
@Controller('cashier_types')
export class CashierTypesController {
    constructor(private readonly cashierTypesService: CashierTypesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.cashierTypesService.findAll(query);
        await this.cashierTypesService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createCashierTypeDto: CreateCashierTypeDto, @Request() req: any) {
        return this.cashierTypesService.create(createCashierTypeDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.cashierTypesService.findAll(query);
    }

    @Get('list')
    listCashierTypes() {
        return this.cashierTypesService.listCashierTypes();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.cashierTypesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCashierTypeDto: UpdateCashierTypeDto,
        @Request() req: any,
    ) {
        return this.cashierTypesService.update(id, updateCashierTypeDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.cashierTypesService.changeStatus(id);
    }
}

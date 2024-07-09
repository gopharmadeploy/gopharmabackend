import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Request,
    Res,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('providers')
export class ProvidersController {
    constructor(private readonly clientsService: ProvidersService) {}

    @Public()
    @Get('export')
    async exportData(@Res() res: Response): Promise<void> {
        const data: any = await this.clientsService.getAllBanks();
        await this.clientsService.exportDataToExcel(data, res);
    }

    @Post()
    create(@Body() createProviderDto: CreateProviderDto, @Request() req: any) {
        return this.clientsService.create(createProviderDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.clientsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clientsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto) {
        return this.clientsService.update(+id, updateProviderDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clientsService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.clientsService.changeStatus(id);
    }
}

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
    Request,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.clientsService.findAll(query);
        await this.clientsService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createClientDto: CreateClientDto, @Request() req: any) {
        return this.clientsService.create(createClientDto, req.user.sub);
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
    update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
        return this.clientsService.update(+id, updateClientDto);
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

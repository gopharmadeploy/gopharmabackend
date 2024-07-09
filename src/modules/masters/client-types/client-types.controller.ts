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
import { ClientTypesService } from './client-types.service';
import { CreateClientTypeDto } from './dto/create-client-type.dto';
import { UpdateClientTypeDto } from './dto/update-client-type.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('client_types')
export class ClientTypesController {
    constructor(private readonly clientTypesService: ClientTypesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.clientTypesService.findAll(query);
        await this.clientTypesService.exportDataToExcel(data.data, res);
    }
    @Post()
    create(@Body() createClientTypeDto: CreateClientTypeDto, @Request() req: any) {
        return this.clientTypesService.create(createClientTypeDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.clientTypesService.findAll(query);
    }

    @Get('list')
    listClientTypes() {
        return this.clientTypesService.listClientTypes();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clientTypesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClientTypeDto: UpdateClientTypeDto) {
        return this.clientTypesService.update(+id, updateClientTypeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clientTypesService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.clientTypesService.changeStatus(id);
    }
}

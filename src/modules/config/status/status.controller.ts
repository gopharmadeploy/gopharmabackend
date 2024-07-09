import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Res,
    Query,
    ParseIntPipe,
    Request,
} from '@nestjs/common';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('status')
@Controller('status')
export class StatusController {
    constructor(private readonly statusService: StatusService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.statusService.findAll(query);
        await this.statusService.exportDataToExcel(data.data, res);
    }
    @Post()
    create(@Body() createStatusDto: CreateStatusDto, @Request() req: any) {
        console.log('Creating status...');
        console.log('objeto del front', createStatusDto); // Verificar el objeto recibido del frontend
        console.log('user id', req.user.sub); // Verificar si el ID de usuario se está recibiendo correctamente
        return this.statusService.create(createStatusDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.statusService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.statusService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateStatusDto,
        @Request() req: any,
    ) {
        return this.statusService.update(id, updateStatusDto);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.statusService.changeStatus(id);
    }
}

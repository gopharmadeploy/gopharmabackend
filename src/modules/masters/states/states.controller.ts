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
import { StatesService } from './states.service';
import { CreateStateDto } from './dto/create-states.dto';
import { UpdateStateDto } from './dto/update-states.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('states')
@Controller('states')
export class StatesController {
    constructor(private readonly statesService: StatesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.statesService.findAll(query);
        await this.statesService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createStateDto: CreateStateDto, @Request() req: any) {
        return this.statesService.create(createStateDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.statesService.findAll(query);
    }

    @Get('list')
    listStates() {
        return this.statesService.listStates();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.statesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStateDto: UpdateStateDto,
        @Request() req: any,
    ) {
        return this.statesService.update(id, updateStateDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.statesService.changeStatus(id);
    }
}

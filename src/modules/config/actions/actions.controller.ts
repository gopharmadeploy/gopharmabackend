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
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('api/actions')
@Controller('actions')
export class ActionsController {
    constructor(private readonly actionsService: ActionsService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.actionsService.findAll(query);
        await this.actionsService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createActionDto: CreateActionDto, @Request() req: any) {
        return this.actionsService.create(createActionDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.actionsService.findAll(query);
    }

    @Get('list')
    listActions() {
        return this.actionsService.listActions();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.actionsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateActionDto: UpdateActionDto,
        @Request() req: any,
    ) {
        return this.actionsService.update(id, updateActionDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.actionsService.changeStatus(id);
    }
}

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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.applicationsService.findAll(query);
        await this.applicationsService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createActionDto: CreateApplicationDto, @Request() req: any) {
        return this.applicationsService.create(createActionDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.applicationsService.findAll(query);
    }

    @Get('list')
    listApplications(@Query() query: any) {
        return this.applicationsService.listApplications(query);
    }

    @Get('profile')
    findAllProfile() {
        return this.applicationsService.findAllProfile();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.applicationsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateActionDto: UpdateApplicationDto,
        @Request() req: any,
    ) {
        return this.applicationsService.update(id, updateActionDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.applicationsService.changeStatus(id);
    }
}

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
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.pagesService.findAll(query);
        await this.pagesService.exportDataToExcel(data.data, res);
    }
    @Post()
    create(@Body() createPageDto: CreatePageDto, @Request() req: any) {
        return this.pagesService.create(createPageDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.pagesService.findAll(query);
    }

    @Get('list')
    listPages() {
        return this.pagesService.listPages();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.pagesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateActionDto: UpdatePageDto,
        @Request() req: any,
    ) {
        return this.pagesService.update(id, updateActionDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.pagesService.changeStatus(id);
    }
}

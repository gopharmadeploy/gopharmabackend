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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('inventory/categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.categoriesService.findAll(query);
        await this.categoriesService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
        return this.categoriesService.create(createCategoryDto, req.user.sub);
    }

    @Get('list')
    listCategories() {
        return this.categoriesService.listCategories();
    }

    @Get()
    findAll(@Query() query: any) {
        return this.categoriesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(+id, updateCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.changeStatus(id);
    }
}

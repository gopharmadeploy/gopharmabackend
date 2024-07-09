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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('inventory/brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.brandsService.findAll(query);
        await this.brandsService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createBrandDto: CreateBrandDto, @Request() req: any) {
        return this.brandsService.create(createBrandDto, req.user.sub);
    }

    @Get('list')
    listBrands() {
        return this.brandsService.listBrands();
    }

    @Get()
    findAll(@Query() query: any) {
        return this.brandsService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.brandsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
        return this.brandsService.update(+id, updateBrandDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.brandsService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.brandsService.changeStatus(id);
    }
}

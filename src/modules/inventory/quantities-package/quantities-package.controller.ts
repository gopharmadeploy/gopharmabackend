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
import { QuantitiesPackageService } from './quantities-package.service';
import { CreateQuantitiesPackageDto } from './dto/create-quantities-package.dto';
import { UpdateQuantitiesPackageDto } from './dto/update-quantities-package.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('inventory/quantities-package')
export class QuantitiesPackageController {
    constructor(private readonly quantitiesPackageService: QuantitiesPackageService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.quantitiesPackageService.findAll(query);
        await this.quantitiesPackageService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createQuantitiesPackageDto: CreateQuantitiesPackageDto, @Request() req: any) {
        return this.quantitiesPackageService.create(createQuantitiesPackageDto, req.user.sub);
    }

    @Get('list')
    listQuantitiesPackage() {
        return this.quantitiesPackageService.listQuantitiesPackage();
    }

    @Get()
    findAll(@Query() query: any) {
        return this.quantitiesPackageService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.quantitiesPackageService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateQuantitiesPackageDto: UpdateQuantitiesPackageDto,
    ) {
        return this.quantitiesPackageService.update(+id, updateQuantitiesPackageDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.quantitiesPackageService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.quantitiesPackageService.changeStatus(id);
    }
}

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
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('packages')
export class PackagesController {
    constructor(private readonly packagesService: PackagesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.packagesService.findAll(query);
        await this.packagesService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createPackageDto: CreatePackageDto, @Request() req: any) {
        return this.packagesService.create(createPackageDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.packagesService.findAll(query);
    }

    @Get('list')
    listPackages() {
        return this.packagesService.listPackages();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.packagesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePackageDto: UpdatePackageDto,
        @Request() req: any,
    ) {
        return this.packagesService.update(id, updatePackageDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.packagesService.changeStatus(id);
    }
}

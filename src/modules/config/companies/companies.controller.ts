import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Request,
    Query,
    ParseIntPipe,
    UseInterceptors,
    Res,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.companiesService.findAll(query);
        await this.companiesService.exportDataToExcel(data.data, res);
    }

    @Post()
    @UseInterceptors(
        FileInterceptor('logo', {
            storage: diskStorage({
                destination: './uploads/companies/logos',
                filename(req, file, callback) {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
        }),
    )
    create(
        @Body() createCompanyDto: CreateCompanyDto,
        @Request() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5000000 }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                ],
                fileIsRequired: false,
            }),
        )
        file?: Express.Multer.File,
    ) {
        return this.companiesService.create(createCompanyDto, req.user.sub, file?.filename || null);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.companiesService.findAll(query);
    }

    @Get('list')
    listCompanies() {
        return this.companiesService.listCompanies();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.companiesService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('logo', {
            storage: diskStorage({
                destination: './uploads/companies/logos',
                filename(req, file, callback) {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
                    callback(null, filename);
                },
            }),
        }),
    )
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCompanyDto: UpdateCompanyDto,
        @Request() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5000000 }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                ],
                fileIsRequired: false,
            }),
        )
        file?: Express.Multer.File,
    ) {
        return this.companiesService.update(
            id,
            updateCompanyDto,
            req.user.sub,
            file?.filename || null,
        );
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.companiesService.changeStatus(id);
    }
}

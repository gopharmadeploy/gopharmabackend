import {
    Controller,
    Get,
    Post,
    Body,
    Res,
    Patch,
    Param,
    Delete,
    Request,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { DocumentTypesService } from './document-types.service';
import { CreateDocumentTypeDto } from './dto/create-document-type.dto';
import { UpdateDocumentTypeDto } from './dto/update-document-type.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('document_types')
export class DocumentTypesController {
    constructor(private readonly documentTypesService: DocumentTypesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.documentTypesService.findAll(query);
        await this.documentTypesService.exportDataToExcel(data.data, res);
    }
    @Post()
    create(@Body() createDocumentTypeDto: CreateDocumentTypeDto, @Request() req: any) {
        return this.documentTypesService.create(createDocumentTypeDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.documentTypesService.findAll(query);
    }

    @Get('list')
    listDocumentTypes(@Query() query: any) {
        return this.documentTypesService.listDocumentTypes(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.documentTypesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDocumentTypeDto: UpdateDocumentTypeDto) {
        return this.documentTypesService.update(+id, updateDocumentTypeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.documentTypesService.remove(+id);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.documentTypesService.changeStatus(id);
    }
}

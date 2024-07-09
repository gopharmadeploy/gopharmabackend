import {
    Controller,
    Get,
    Post,
    Body,
    Res,
    Patch,
    Param,
    Query,
    ParseIntPipe,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MoneyService } from './money.service';
import { CreateMoneyDto } from './dto/create-money.dto';
import { UpdateMoneyDto } from './dto/update-money.dto';
import { v4 as uuidv4 } from 'uuid';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@Controller('administrative/money')
export class MoneyController {
    constructor(private readonly moneyService: MoneyService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.moneyService.findAll(query);
        await this.moneyService.exportDataToExcel(data.data, res);
    }

    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/money',
                filename: (req, file, cb) => {
                    const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueSuffix);
                },
            }),
        }),
    )
    create(@Body() createMoneyDto: CreateMoneyDto, @UploadedFile() file: Express.Multer.File) {
        if (file) {
            createMoneyDto.file = file.filename; // Save the filename in the DTO
        }
        console.log(createMoneyDto);
        return this.moneyService.create(createMoneyDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.moneyService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.moneyService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/money',
                filename: (req, file, cb) => {
                    const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, uniqueSuffix);
                },
            }),
        }),
    )
    update(
        @Param('id') id: string,
        @Body() updateMoneyDto: UpdateMoneyDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (file) {
            updateMoneyDto.file = file.filename; // Save the filename in the DTO
        }
        return this.moneyService.update(+id, updateMoneyDto);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.moneyService.changeStatus(id);
    }
}

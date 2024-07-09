import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    ParseIntPipe,
    Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/decorators/isPublic.decorator';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { Response } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.usersService.findAll(query);
        await this.usersService.exportDataToExcel(data.data, res);
    }

    @Public()
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/users',
                filename: (req, file, cb) => {
                    const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
                    cb(null, `${uniqueSuffix}`);
                },
            }),
        }),
    )
    async create(@UploadedFile() file: Express.Multer.File, @Body() createUserDto: CreateUserDto) {
        let filePath = null;

        if (file) {
            filePath = `uploads/users/${file.filename}`;
        }

        return this.usersService.create(createUserDto, filePath);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.usersService.findAll(query);
    }

    @Public()
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        console.log('desde controller de users, buscando id', id);
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
        console.log('actualizando usuario desde controlador', updateUserDto);

        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.changeStatus(id);
    }

    @Public()
    @Post('/updatePassword')
    changePassword(@Body() changePasswordBody: any) {
        console.log('contraseña nueva e id desde controlador', changePasswordBody);

        return this.usersService.updatePassword(
            changePasswordBody.userId,
            changePasswordBody.password,
        );
    }

    @Public()
    @Post('/changePassByEmail')
    findEmail(@Body() email: string) {
        console.log('buscando este email desde el controlador', email);

        return this.usersService.findByEmail(email);
    }
}

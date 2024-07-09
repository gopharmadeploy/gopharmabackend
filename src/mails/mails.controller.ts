import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailsService } from './mails.service';
import { SendMailDto } from './dto/create-mail.dto';
import { UpdateMailDto } from './dto/update-mail.dto';
import { Public } from 'src/decorators/isPublic.decorator';

@Public()
@Controller('mails')
export class MailsController {
    constructor(private readonly mailsService: MailsService) {}

    @Get()
    findAll() {
        return this.mailsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mailsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMailDto: UpdateMailDto) {
        return this.mailsService.update(+id, updateMailDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.mailsService.remove(+id);
    }

    @Post('/resetPassword')
    create(@Body() idUser: string) {
        console.log(' recibiendo id ', idUser);
        return this.mailsService.sendResetPassMail(idUser);
    }

    @Post('/resetPasswordToEmail')
    lookForEmail(@Body() email: string) {
        console.log(' recibiendo email desde controlador ', email);
        return this.mailsService.sendResetPassMailByEmail(email);
    }
}

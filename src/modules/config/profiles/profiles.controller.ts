import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Request,
    ParseIntPipe,
    Res,
    Query,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/isPublic.decorator';
import { Response } from 'express';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) {}

    @Public()
    @Get('export')
    async exportData(@Query() query: any, @Res() res: Response): Promise<void> {
        query.export = 1;
        const data: any = await this.profilesService.findAll(query);
        await this.profilesService.exportDataToExcel(data.data, res);
    }

    @Post()
    create(@Body() createActionDto: CreateProfileDto, @Request() req: any) {
        return this.profilesService.create(createActionDto, req.user.sub);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.profilesService.findAll(query);
    }

    @Get('list')
    listProfiles() {
        return this.profilesService.listProfiles();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.profilesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateActionDto: UpdateProfileDto,
        @Request() req: any,
    ) {
        return this.profilesService.update(id, updateActionDto, req.user.sub);
    }

    @Patch(':id/change_status')
    changeStatus(@Param('id', ParseIntPipe) id: number) {
        return this.profilesService.changeStatus(id);
    }
}

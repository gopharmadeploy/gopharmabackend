import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/isPublic.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: Record<string, any>) {
        return this.authService.signIn(signInDto.username, signInDto.password);
    }

    @Get('/logout')
    logout(@Request() req): any {
        req.session.destroy();
        return { msg: 'The user session has ended' };
    }

    @Public()
    @Get('/menu/:id')
    getMenu(@Param('id', ParseIntPipe) id: number): any {
        return this.authService.getMenu(id);
    }
}

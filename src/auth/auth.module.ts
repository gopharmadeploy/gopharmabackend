import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/config/users/users.module';
import { ProfilesModule } from 'src/modules/config/profiles/profiles.module';

@Module({
    imports: [
        UsersModule,
        ProfilesModule,
        JwtModule.register({
            global: true,
            secret: 'secret',
            // signOptions: { expiresIn: '60s' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}

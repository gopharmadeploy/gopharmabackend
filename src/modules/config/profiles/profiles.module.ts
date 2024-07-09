import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfilePages } from './entities/profilePages.entity';
import { ApplicationsModule } from '../applications/applications.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Profile, ProfilePages]), UsersModule, ApplicationsModule],
    controllers: [ProfilesController],
    providers: [ProfilesService],
    exports: [ProfilesService],
})
export class ProfilesModule {}

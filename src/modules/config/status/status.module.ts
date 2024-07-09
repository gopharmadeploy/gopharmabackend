import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Status } from './entities/status.entity';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Status]), UsersModule],
    controllers: [StatusController],
    providers: [StatusService],
})
export class StatusModule {}

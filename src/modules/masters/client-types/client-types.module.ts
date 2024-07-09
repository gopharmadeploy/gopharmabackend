import { Module } from '@nestjs/common';
import { ClientTypesService } from './client-types.service';
import { ClientTypesController } from './client-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientType } from './entities/client-type.entity';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([ClientType]), UsersModule],
    controllers: [ClientTypesController],
    providers: [ClientTypesService],
})
export class ClientTypesModule {}

import { Module } from '@nestjs/common';
import { TypesPackagingService } from './types-packaging.service';
import { TypesPackagingController } from './types-packaging.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypesPackaging } from './entities/types-packaging.entity';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([TypesPackaging]), UsersModule],
    controllers: [TypesPackagingController],
    providers: [TypesPackagingService],
    exports: [TypesPackagingService],
})
export class TypesPackagingModule {}

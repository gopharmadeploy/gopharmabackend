import { Module } from '@nestjs/common';
import { IdentificationTypesService } from './identification-types.service';
import { IdentificationTypesController } from './identification-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentificationType } from './entities/identification-type.entity';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([IdentificationType]), UsersModule],
    controllers: [IdentificationTypesController],
    providers: [IdentificationTypesService],
})
export class IdentificationTypesModule {}

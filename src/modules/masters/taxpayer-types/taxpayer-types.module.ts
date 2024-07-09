import { Module } from '@nestjs/common';
import { TaxpayerTypesService } from './taxpayer-types.service';
import { TaxpayerTypesController } from './taxpayer-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxpayerType } from './entities/taxpayer-type.entity';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([TaxpayerType]), UsersModule],
    controllers: [TaxpayerTypesController],
    providers: [TaxpayerTypesService],
})
export class TaxpayerTypesModule {}

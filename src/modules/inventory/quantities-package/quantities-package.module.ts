import { Module } from '@nestjs/common';
import { QuantitiesPackageService } from './quantities-package.service';
import { QuantitiesPackageController } from './quantities-package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuantitiesPackage } from './entities/quantities-package.entity';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([QuantitiesPackage]), UsersModule],
    controllers: [QuantitiesPackageController],
    providers: [QuantitiesPackageService],
    exports: [QuantitiesPackageService],
})
export class QuantitiesPackageModule {}

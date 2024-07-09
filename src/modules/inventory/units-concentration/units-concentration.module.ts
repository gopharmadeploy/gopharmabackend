import { Module } from '@nestjs/common';
import { UnitsConcentrationService } from './units-concentration.service';
import { UnitsConcentrationController } from './units-concentration.controller';
import { UnitsConcentration } from './entities/units-concentration.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([UnitsConcentration]), UsersModule],
    controllers: [UnitsConcentrationController],
    providers: [UnitsConcentrationService],
    exports: [UnitsConcentrationService],
})
export class UnitsConcentrationModule {}

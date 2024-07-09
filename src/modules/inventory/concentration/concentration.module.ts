import { Module } from '@nestjs/common';
import { ConcentrationService } from './concentration.service';
import { ConcentrationController } from './concentration.controller';
import { Concentration } from './entities/concentration.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsConcentrationModule } from '../units-concentration/units-concentration.module';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Concentration]), UsersModule, UnitsConcentrationModule],
    controllers: [ConcentrationController],
    providers: [ConcentrationService],
    exports: [ConcentrationService],
})
export class ConcentrationModule {}

export { Concentration };

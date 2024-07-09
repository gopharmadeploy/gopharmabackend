import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrative_Bank } from '../banks/entities/bank.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Administrative_Bank])],
    controllers: [BanksController],
    providers: [BanksService],
})
export class BanksModule {}

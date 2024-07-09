import { Module } from '@nestjs/common';
import { MoneyService } from './money.service';
import { MoneyController } from './money.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrative_Money } from './entities/money.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Administrative_Money])],
    controllers: [MoneyController],
    providers: [MoneyService],
    exports: [MoneyService, TypeOrmModule],
})
export class MoneyModule {}

import { Module, forwardRef } from '@nestjs/common';
import { ExchangeRateService } from './exchange_rate.service';
import { ExchangeRateController } from './exchange_rate.controller';
import { ExchangeRate } from './entities/exchange_rate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyModule } from '../money/money.module';
import { ScrappingServiceModule } from '../scrapping_service/scrapping_service.module';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExchangeRate]),
        UsersModule,
        MoneyModule,
        forwardRef(() => ScrappingServiceModule),
    ],
    controllers: [ExchangeRateController],
    providers: [ExchangeRateService],
    exports: [ExchangeRateService],
})
export class ExchangeRateModule {}

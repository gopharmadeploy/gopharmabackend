import { Module, forwardRef } from '@nestjs/common';
import { ScrappingServiceService } from './scrapping_service.service';
import { ScrappingServiceController } from './scrapping_service.controller';
import { MoneyModule } from '../money/money.module';
import { ExchangeRateModule } from '../exchange_rate/exchange_rate.module';
import { ScrappingServiceSchedulerService } from './scrapping_service-scheduler.service';
import { MailsModule } from 'src/mails/mails.module';
import { SocketModule } from 'src/socket/socket.module';



@Module({
  imports: [
    MoneyModule,
    forwardRef(() => ExchangeRateModule),
    MailsModule,
    SocketModule
  ],
  controllers: [ScrappingServiceController],
  providers: [
    ScrappingServiceSchedulerService ,
    ScrappingServiceService,
  ],
  exports: [ScrappingServiceService],
})
export class ScrappingServiceModule {}

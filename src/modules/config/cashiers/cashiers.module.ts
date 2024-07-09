import { Module } from '@nestjs/common';
import { CashiersService } from './cashiers.service';
import { CashiersController } from './cashiers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cashier } from './entities/cashier.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Cashier]), UsersModule],
    controllers: [CashiersController],
    providers: [CashiersService],
})
export class CashiersModule {}

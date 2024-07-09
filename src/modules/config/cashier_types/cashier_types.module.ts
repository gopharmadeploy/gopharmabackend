import { Module } from '@nestjs/common';
import { CashierTypesService } from './cashier_types.service';
import { CashierTypesController } from './cashier_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashierType } from './entities/cashier_type.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([CashierType]), UsersModule],
    controllers: [CashierTypesController],
    providers: [CashierTypesService],
})
export class CashierTypesModule {}

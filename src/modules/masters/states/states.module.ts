import { Module } from '@nestjs/common';
import { StatesService } from './states.service';
import { StatesController } from './states.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([State]), UsersModule],
    controllers: [StatesController],
    providers: [StatesService],
})
export class StatesModule {}

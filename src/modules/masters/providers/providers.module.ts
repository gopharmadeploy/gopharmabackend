import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './entities/provider.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Provider]), UsersModule],
    controllers: [ProvidersController],
    providers: [ProvidersService],
})
export class ProvidersModule {}

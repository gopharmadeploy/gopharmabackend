import { Module } from '@nestjs/common';
import { TypesPresentationService } from './types-presentation.service';
import { TypesPresentationController } from './types-presentation.controller';
import { TypesPresentation } from './entities/types-presentation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([TypesPresentation]), UsersModule],
    controllers: [TypesPresentationController],
    providers: [TypesPresentationService],
    exports: [TypesPresentationService],
})
export class TypesPresentationModule {}

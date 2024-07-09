import { Module } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';
import { Catalogue } from './entities/catalogue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategoriesModule } from '../sub-categories/sub-categories.module';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Catalogue]), UsersModule, SubCategoriesModule],
    controllers: [CatalogueController],
    providers: [CatalogueService],
})
export class CatalogueModule {}

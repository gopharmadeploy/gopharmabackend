import { Module } from '@nestjs/common';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategoriesController } from './sub-categories.controller';
import { SubCategory } from './entities/sub-category.entity';
import { CategoriesModule } from '../categories/categories.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([SubCategory]), UsersModule, CategoriesModule],
    controllers: [SubCategoriesController],
    providers: [SubCategoriesService],
    exports: [SubCategoriesService],
})
export class SubCategoriesModule {}

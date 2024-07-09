import { Module } from '@nestjs/common';
import { DocumentTypesService } from './document-types.service';
import { DocumentTypesController } from './document-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentType } from './entities/document-type.entity';
import { UsersModule } from 'src/modules/config/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([DocumentType]), UsersModule],
    controllers: [DocumentTypesController],
    providers: [DocumentTypesService],
})
export class DocumentTypesModule {}

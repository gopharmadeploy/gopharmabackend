import { ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { Page } from '../entities/page.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Package } from '../../packages/entities/package.entity';
import { Application } from '../../applications/entities/application.entity';

export class CreatePageDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty()
    @IsString()
    @ValidateIf((object, value) => value)
    readonly route?: string;

    @ApiProperty()
    @IsString()
    @ValidateIf((object, value) => value)
    readonly icon?: string;

    @ApiProperty()
    @IsArray()
    @ArrayMinSize(1)
    readonly packages: Package[];

    @ApiProperty()
    readonly pageFather?: Page;

    @ApiProperty()
    @IsNotEmpty()
    readonly application: Application;
}

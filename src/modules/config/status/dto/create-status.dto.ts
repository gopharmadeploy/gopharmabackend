import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStatusDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly status: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly module: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClientTypeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.toUpperCase())
    readonly name: string;
}

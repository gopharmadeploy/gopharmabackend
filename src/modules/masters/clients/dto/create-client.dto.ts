import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateClientDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.toUpperCase())
    readonly name: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly city: any;

    @ApiProperty()
    @IsNotEmpty()
    readonly taxpayer: any;

    @ApiProperty()
    @IsNotEmpty()
    readonly clientType: any;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => +value)
    readonly phone: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    readonly email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly observations: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly address: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly identification: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly documentType: any;
}

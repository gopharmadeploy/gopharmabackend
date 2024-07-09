import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly address: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly phone: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly rif: string;

    @ApiProperty()
    readonly logo?: any;
}

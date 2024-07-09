import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly password: string;

    @ApiProperty()
    readonly role?: number;


    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly fullName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly phoneNumber: string;


    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly dni: string;



    
}

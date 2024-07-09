import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty,  IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string


    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    fullName: string;


    
}

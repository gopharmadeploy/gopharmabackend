import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMailDto {
    @IsOptional()
    id?: number;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    fullName: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    phoneNumber: string;

    @IsNotEmpty()
    dni: string;

    @IsNotEmpty()
    password: string;
}

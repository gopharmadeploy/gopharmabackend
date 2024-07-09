import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBankDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    @IsOptional()
    branch?: string;
    @IsString()
    @IsOptional()
    adress?: string;
    @IsNumber()
    @IsNotEmpty()
    bankCode: number;
    @IsNumber()
    @IsOptional()
    ssn?: number;
    @IsNumber()
    @IsOptional()
    phone?: number;
    @IsString()
    @IsOptional()
    email?: string;
    @IsString()
    @IsOptional()
    aba?: string;
    @IsNumber()
    @IsOptional()
    routeNumber?: number;
    @IsString()
    @IsOptional()
    swift?: string;
    @IsString()
    @IsOptional()
    urbanization?: string;
    @IsString()
    @IsOptional()
    street?: string;
    @IsString()
    @IsOptional()
    building?: string;
    @IsString()
    @IsOptional()
    municipality?: string;
    @IsString()
    @IsOptional()
    city?: string;
    @IsString()
    @IsOptional()
    codeZip?: string;
}

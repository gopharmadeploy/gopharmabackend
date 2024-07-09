import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProviderDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly contacts: [];

    @ApiProperty()
    @IsNotEmpty()
    readonly accounts: [];

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly address: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly website: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    readonly taxRetentionPercentage: number;

    @ApiProperty()
    @IsNotEmpty()
    readonly taypayerType: any;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsIP, IsMACAddress, IsNotEmpty, IsString } from 'class-validator';

export class CreateCashierDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @ApiProperty()
    @IsIP()
    @IsNotEmpty()
    readonly ipAddress: string;

    @ApiProperty()
    @IsMACAddress()
    @IsNotEmpty()
    readonly mac: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly cashierType: any;

    @ApiProperty()
    @IsNotEmpty()
    readonly printer: any;
}

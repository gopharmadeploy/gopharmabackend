import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsIP, IsMACAddress, IsNotEmpty, IsPort, IsString } from 'class-validator';

export class CreatePrinterDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly serialNumber: string;

    @ApiProperty()
    @IsIP()
    @IsNotEmpty()
    readonly ipAddress: string;

    @ApiProperty()
    @IsPort()
    @IsNotEmpty()
    readonly port: string;

    @ApiProperty()
    @IsMACAddress()
    @IsNotEmpty()
    readonly mac: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly conectionUser: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly conectionPassword: string;

    @ApiProperty()
    @IsDate()
    @Transform(({ value }) => {
        console.log(value);

        return new Date(value);
    })
    @ApiProperty()
    @IsNotEmpty()
    readonly instalationDate: Date;

    @ApiProperty()
    @IsNotEmpty()
    readonly printerModel: any;

    @ApiProperty()
    @IsNotEmpty()
    readonly printerType: any;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePrinterModelDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly model: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly printerBrand: any;
}

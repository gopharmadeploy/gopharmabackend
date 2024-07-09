import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePrinterBrandDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly brand: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePrinterTypeDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly type: string;
}

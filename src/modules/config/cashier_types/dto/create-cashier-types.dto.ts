import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCashierTypeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly type: string;
}

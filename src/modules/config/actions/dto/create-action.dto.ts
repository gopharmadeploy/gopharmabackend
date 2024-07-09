import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateActionDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}

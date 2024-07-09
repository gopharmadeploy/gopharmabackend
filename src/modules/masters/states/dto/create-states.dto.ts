import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStateDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}

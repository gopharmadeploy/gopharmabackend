import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUnitsMeasurementDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}

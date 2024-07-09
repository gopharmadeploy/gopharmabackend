import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { QuantitiesPackage } from '../../quantities-package/entities/quantities-package.entity';

export class CreateCatalogueDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly code: string;

    @IsString()
    @IsNotEmpty()
    readonly barcode: string;

    @IsString()
    readonly description: string;

    @IsString()
    @IsNotEmpty()
    readonly pharmaceuticalDescription: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly brand: any;

    @ApiProperty()
    @IsNotEmpty()
    readonly subCategory: any;

    @ApiProperty()
    readonly typesPresentation: any;

    @ApiProperty()
    readonly concentration: any;

    @ApiProperty()
    readonly unitConcentration: any;

    @ApiProperty()
    @IsNotEmpty()
    readonly typesPackaging: any;

    @ApiProperty()
    @IsNotEmpty()
    readonly unitMeasurement: any;

    @ApiProperty()
    @IsNotEmpty()
    readonly quantityPackage: any;

    @ApiProperty()
    readonly img?: any;
}

import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateExchangeRateDto {
    @IsNotEmpty()
    @IsNumber()
    currencyId: number;

    @IsNotEmpty()
    @IsNumber()
    exchangeToCurrency: number;

    @IsNotEmpty()
    @IsNumber()
    exchange: number;
}
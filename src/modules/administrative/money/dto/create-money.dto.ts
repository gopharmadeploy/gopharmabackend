import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMoneyDto {
    @IsString()
    @IsNotEmpty()
    money: string;
    file?: string;
    @IsString()
    @IsNotEmpty()
    symbol: string;
}

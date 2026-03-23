import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRedemptionDto {
    @IsNotEmpty()
    @IsString()
    rewardId: string;
}

export class ValidateCodeDto {
    @IsNotEmpty()
    @IsString()
    code: string;
}
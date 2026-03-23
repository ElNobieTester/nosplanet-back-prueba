import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRedemptionDto {
    @ApiProperty({
        description: 'ID único del premio (Reward) que el usuario desea canjear',
        example: '65f1a2b3c4d5e6f7g8h9i0j1',
    })
    @IsNotEmpty()
    @IsString()
    rewardId: string;
}

export class ValidateCodeDto {
    @ApiProperty({
        description: 'Código alfanumérico generado por la App (Formato ECO-XXXXX)',
        example: 'ECO-H7A2K',
    })
    @IsNotEmpty()
    @IsString()
    code: string;
}
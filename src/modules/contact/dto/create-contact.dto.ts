import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateContactDto {
    @ApiProperty({ example: 'Juan Perez', description: 'Full name of the contact' })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'juan@example.com', description: 'Email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '+51 987 654 321', description: 'Phone number' })
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty({ example: 'Quiero unirme al proyecto verde', description: 'Message' })
    @IsNotEmpty()
    @IsString()
    message: string;
}

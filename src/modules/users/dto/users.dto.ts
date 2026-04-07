import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsNotEmpty, IsArray } from 'class-validator';
import { UserRole } from '../enum/userRole.enum';

export class CreateUserDto {
    @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del usuario' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: 'juan@gmail.com', description: 'Correo electrónico' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Contraseña de acceso' })
    @IsString()
    @IsNotEmpty()
    password: string;

    // --- NUEVOS CAMPOS DE UBICACIÓN ---
    @ApiProperty({ example: 'Lima', description: 'Departamento de residencia' })
    @IsString()
    @IsNotEmpty()
    department: string;

    @ApiProperty({ example: 'San Juan de Miraflores', description: 'Distrito de residencia' })
    @IsString()
    @IsNotEmpty()
    district: string;

    @ApiProperty({ enum: UserRole, default: UserRole.CITIZEN, description: 'Rol del usuario' })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ example: '12345678', required: false, description: 'DNI o documento de identidad' })
    @IsOptional()
    @IsString()
    documentNumber?: string;

    @ApiProperty({ example: '987654321', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'https://mi-avatar.com/foto.jpg', required: false })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiProperty({ example: 'Municipalidad de Lima', required: false })
    @IsOptional()
    @IsString()
    institution?: string;

    @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false })
    @IsOptional()
    @IsString()
    managerId?: string;

    @ApiProperty({ example: ['id_programa_1'], required: false })
    @IsOptional()
    @IsArray()
    programs?: string[];
}
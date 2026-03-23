import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { UserRole } from '../enum/userRole.enum'; // Asegúrate de tener este enum

export class CreateUserDto {
    // --- DATOS OBLIGATORIOS (Google y Local los tienen) ---

    @ApiProperty({ example: 'Juan Perez', description: 'Full Name provided by user or Google' })
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'juan@gmail.com', description: 'Email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'local', description: 'Auth Provider', default: 'local' })
    @IsString()
    authProvider: string; // 'google' o 'local'

    @ApiProperty({ enum: UserRole, default: UserRole.CITIZEN, description: 'User role' })
    @IsEnum(UserRole)
    role: UserRole;

    // --- DATOS OPCIONALES (Google NO los entrega al inicio) ---

    @ApiProperty({
        example: '12345678',
        description: 'Document Number (DNI)',
        required: false // <--- IMPORTANTE: Opcional para Google
    })
    @IsOptional()
    @IsString()
    documentNumber?: string;

    @ApiProperty({
        example: 'hashed_password_xyz',
        description: 'Password (hashed)',
        required: false // <--- IMPORTANTE: Google no tiene password
    })
    @IsOptional()
    @IsString()
    password?: string; // En el DTO recibimos "password" plana, el hash se hace en el servicio

    @ApiProperty({
        example: '987654321',
        description: 'Phone number',
        required: false // <--- Google no suele dar el teléfono
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        example: 'https://lh3.googleusercontent.com/...',
        description: 'Avatar URL',
        required: false
    })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiProperty({
        description: 'Google ID for mapping',
        required: false
    })
    @IsOptional()
    @IsString()
    googleId?: string;

    @ApiProperty({
        example: 'Municipalidad de Lima',
        description: 'Institution or Municipality for Gestores',
        required: false
    })
    @IsOptional()
    @IsString()
    institution?: string;

    @ApiProperty({
        example: '507f1f77bcf86cd799439011',
        description: 'Manager ID for Coordinators',
        required: false
    })
    @IsOptional()
    @IsString()
    managerId?: string;

    @ApiProperty({
        example: ['507f1f77bcf86cd799439011'],
        description: 'Programs for Coordinators',
        required: false
    })
    @IsOptional()
    @IsArray()
    programs?: string[];
}
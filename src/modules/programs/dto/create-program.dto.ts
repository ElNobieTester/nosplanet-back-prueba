import { Type } from 'class-transformer';
import {
    IsString,
    IsEnum,
    IsNumber,
    IsArray,
    ValidateNested,
    IsNotEmpty,
    IsOptional,
    IsUrl,
    Min
} from 'class-validator';
import { ProgramType } from '../enum/progra-type.enum';
import { ApiProperty } from '@nestjs/swagger';

// DTO Auxiliar para Contacto
class ContactDto {
    @ApiProperty({ example: 'email@example.com', description: 'Email del contacto' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '123456789', description: 'Telefono del contacto' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: 'https://www.example.com', description: 'Website del contacto' })
    @IsOptional()
    @IsString()
    website?: string;
}

export class CreateProgramDto {
    @ApiProperty({ example: 'Titulo del programa', description: 'Titulo del programa' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Organizacion del programa', description: 'Organizacion del programa' })
    @IsString()
    @IsNotEmpty()
    organization: string;

    @ApiProperty({ example: 'ONG', description: 'Tipo de organizacion' })
    @IsEnum(ProgramType, { message: 'El tipo debe ser ONG, ESTADO o NOS_PLANET' })
    organizationType: ProgramType;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: '100', description: 'Numero de participantes' })
    participants?: number;

    @ApiProperty({ example: 'Lima', description: 'Ubicacion del programa' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ example: '1 mes', description: 'Duracion del programa' })
    @IsString()
    @IsNotEmpty()
    duration: string;

    @ApiProperty({ example: '10', description: 'Puntos del programa' })
    @IsNumber()
    @Min(0)
    points: number;

    @ApiProperty({ example: 'Descripcion del programa', description: 'Descripcion del programa' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: ['Objetivo 1', 'Objetivo 2'], description: 'Objetivos del programa' })
    @IsArray()
    @IsString({ each: true })
    objectives: string[];

    @ApiProperty({ example: ['Actividad 1', 'Actividad 2'], description: 'Actividades del programa' })
    @IsArray()
    @IsString({ each: true })
    activities: string[];

    @ApiProperty({ example: 'email@example.com', description: 'Email del contacto' })
    @ValidateNested()
    @Type(() => ContactDto)
    contact: ContactDto;

    @ApiProperty({ example: 'https://www.example.com', description: 'URL de la imagen del programa' })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiProperty({ example: '2023-10-01', description: 'Fecha del programa' })
    @IsOptional()
    @IsString()
    date?: string;

    @ApiProperty({ example: 'PROYECTO', description: 'Categoría del programa' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ example: 'Seguir estos pasos...', description: 'Indicaciones especiales' })
    @IsOptional()
    @IsString()
    indications?: string;

    @ApiProperty({ example: ['id_coord_1'], description: 'Lista de coordinadores' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    coordinatorList?: string[];

    @IsOptional()
    @IsArray()
    participantList?: any[];

    @ApiProperty({ example: ['id_user_1', { userId: 'id_user_1', at: '2023-10-01' }], description: 'Lista de asistentes' })
    @IsOptional()
    @IsArray()
    attendedList?: any[];
}
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

// 1. DTO Auxiliar para Ubicación (NUEVO)
class LocationDto {
    @ApiProperty({ example: 'Parque Central de Miraflores', description: 'Nombre físico o virtual del lugar' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'https://maps.app.goo.gl/xyz',
        description: 'URL de Google Maps o enlace de reunión',
        required: false
    })
    @IsOptional()
    @IsUrl({}, { message: 'El formato de la URL de ubicación no es válido' })
    mapUrl?: string;
}

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

    @ApiProperty({ example: 'ONG', description: 'Tipo de organizacion', enum: ProgramType })
    @IsEnum(ProgramType, { message: 'El tipo debe ser ONG, ESTADO o NOS_PLANET' })
    organizationType: ProgramType;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 100, description: 'Numero de participantes' })
    participants?: number;

    // --- CAMBIO AQUÍ: Ahora es un objeto validado ---
    @ApiProperty({ type: LocationDto, description: 'Detalles de la ubicación' })
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @ApiProperty({ example: '1 mes', description: 'Duracion del programa' })
    @IsString()
    @IsNotEmpty()
    duration: string;

    @ApiProperty({ example: 10, description: 'Puntos del programa' })
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

    @ApiProperty({ type: ContactDto, description: 'Información de contacto' })
    @ValidateNested()
    @Type(() => ContactDto)
    contact: ContactDto;

    @ApiProperty({ example: 'https://www.example.com/image.png', description: 'URL de la imagen' })
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

    @ApiProperty({ example: [], description: 'Lista de asistentes' })
    @IsOptional()
    @IsArray()
    attendedList?: any[];
}
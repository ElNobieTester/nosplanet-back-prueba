
import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInductionDto {
    @ApiProperty({ description: 'The title of the video', example: 'Reducir, Reutilizar y Reciclar' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Category of the video', example: 'Tutorial', enum: ['Tutorial', 'Reciclaje', 'Eco-Tips', 'Premios'] })
    @IsString()
    @IsIn(['Tutorial', 'Reciclaje', 'Eco-Tips', 'Premios'])
    category: string;

    @ApiProperty({ description: 'Duration of the video', example: '3:45' })
    @IsString()
    duration: string;

    @ApiProperty({ description: 'Number of views', example: 1200, required: false })
    @IsNumber()
    @IsOptional()
    views?: number;

    @ApiProperty({ description: 'eco Points for completion', example: 15 })
    @IsNumber()
    ecoPoints: number;

    @ApiProperty({ description: 'YouTube Video URL', example: 'https://www.youtube.com/watch?v=cvakvfXj0KE' })
    @IsString()
    @IsUrl()
    videoUrl: string;

    @ApiProperty({ description: 'Description of the video', example: 'Aprende las 3R del reciclaje...' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Is the video active?', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

import { IsString, IsNotEmpty, IsEnum, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ForumCategory } from '../enum/forum-category.enum';

export class CreatePostDto {
    @ApiProperty({ example: 'Propuesta: Huerto urbano', description: 'Título del post' })
    @IsString()
    @IsNotEmpty()
    @Length(5, 100) // Mínimo 5 letras, máximo 100
    title: string;

    @ApiProperty({ example: 'Estamos juntando firmas...', description: 'Contenido del post' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        enum: ForumCategory,
        example: ForumCategory.PROYECTOS,
        description: 'Categoría del post (Proyectos, Dudas, etc)'
    })
    @IsEnum(ForumCategory)
    category: ForumCategory;

    @ApiProperty({ example: 'https://...', description: 'URL de la imagen (opcional)' })
    @IsString()
    @IsOptional()
    image?: string;
}
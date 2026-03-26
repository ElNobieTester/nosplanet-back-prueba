import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePartnerDto {
    @ApiProperty({ description: 'Name of the partner', example: 'Nos Planét' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Filter category', example: 'corporate', enum: ['financial', 'government', 'ong', 'corporate', 'all'] })
    @IsString()
    @IsIn(['financial', 'government', 'ong', 'corporate', 'all'])
    filterType: string;

    @ApiProperty({ description: 'Visible label for type', example: 'Plataforma' })
    @IsString()
    typeLabel: string;

    @ApiProperty({ description: 'Logo URL', example: 'https://example.com/logo.png' })
    @IsString()
    @Transform(({ value }) => {
        if (typeof value === 'string' && value.length > 0) {
            // Si ya tiene http o https, lo dejamos igual. Si no, le pegamos https://
            return value.startsWith('http') ? value : `https://${value}`;
        }
        return value;
    })
    logo: string;

    @ApiProperty({ description: 'Main Brand Color (Hex)', example: '#002C77' })
    @IsString()
    mainColor: string;

    @ApiProperty({ description: 'Short description', example: 'Beneficios exclusivos...' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Environmental commitment text', example: 'Nuestra misión es...' })
    @IsString()
    environmentalCommitment: string;

    @ApiProperty({ description: 'Number of rewards available', example: 5 })
    @IsNumber()
    rewardsCount: number;

    @ApiProperty({ description: 'Number of users involved', example: 1200 })
    @IsNumber()
    usersCount: number;

    @ApiProperty({ description: 'Show at top of list', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isPinned?: boolean;

    @ApiProperty({ description: 'Visible on landing page', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isVisible?: boolean;

    @ApiProperty({ description: 'Requires completion before visibility', example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isLocked?: boolean;

    @ApiProperty({ description: 'URL del sitio web', required: false })
    @IsOptional()
    @IsUrl()
    websiteUrl?: string; // <--- NUEVO
}

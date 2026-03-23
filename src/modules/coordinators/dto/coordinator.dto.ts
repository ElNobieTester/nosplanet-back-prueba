import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, IsMongoId, IsBoolean } from 'class-validator';

export class CreateCoordinatorDto {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsNotEmpty()
    @IsMongoId()
    managerId: string;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    programs?: string[];
}

export class UpdateCoordinatorDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    programs?: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

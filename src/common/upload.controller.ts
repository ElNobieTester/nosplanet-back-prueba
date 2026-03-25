import {
    Controller, Post, UseInterceptors, UploadedFile,
    BadRequestException, UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from './firebase.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
    constructor(private readonly firebaseService: FirebaseService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Subir archivo genérico a Firebase desde el Backend' })
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se ha proporcionado ningún archivo');
        }

        // Subimos a la carpeta 'web_uploads' por defecto
        const result = await this.firebaseService.uploadFile(file, 'web_uploads');
        return {
            url: result.url,
            success: true
        };
    }
}

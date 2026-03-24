import {
    Controller, Get, Post, Body, Param, Patch, UseGuards,
    Request, UnauthorizedException, Delete, UseInterceptors,
    UploadedFile, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForumService } from '../service/forum.service';
import { CloudinaryService } from 'src/common/cloudinary.service'; // ☁️ Asegúrate que la ruta sea correcta
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreatePostDto } from '../dto/create-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from '../dto/create-commet.dto';

@ApiTags('Forum')
@Controller('forum')
@ApiBearerAuth()
export class ForumController {
    constructor(
        private readonly forumService: ForumService,
        private readonly cloudinaryService: CloudinaryService // 🚀 Inyectamos el servicio
    ) { }

    // Función auxiliar para obtener el ID de forma robusta (como en Requests)
    private getUserId(req: any): string {
        return req.user?.id || req.user?.userId || req.user?._id || req.user?.sub;
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('file')) // 📸 'file' debe ser el nombre del campo en el FormData de Expo
    @ApiConsumes('multipart/form-data') // 📝 Necesario para que Swagger muestre el botón de subir archivo
    @ApiOperation({ summary: 'Crear un nuevo post en el foro con imagen opcional' })
    async create(
        @Body() createPostDto: CreatePostDto,
        @Request() req,
        @UploadedFile() file?: Express.Multer.File // El '?' lo hace opcional
    ) {
        const userId = this.getUserId(req);
        if (!userId) throw new UnauthorizedException('Usuario no identificado');

        let imageUrl = createPostDto.image || null;

        // Si el usuario subió una imagen (Multer), la mandamos a Cloudinary
        if (file) {
            const imageResult = await this.cloudinaryService.uploadFile(file);
            imageUrl = imageResult.secure_url;
        }

        // Enviamos todo al servicio
        return this.forumService.create({
            ...createPostDto,
            imageUrl // Pasamos la URL (será null si no hay foto)
        }, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los posts (Feed)' })
    findAll() {
        return this.forumService.findAll();
    }

    @Patch(':id/like')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Dar o quitar like a un post' })
    toggleLike(@Param('id') id: string, @Request() req) {
        const userId = this.getUserId(req);
        if (!userId) throw new UnauthorizedException('No se pudo obtener el ID del usuario');
        return this.forumService.toggleLike(id, userId);
    }

    @Post('comment')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Agregar un comentario a un post' })
    addComment(@Body() body: CreateCommentDto, @Request() req) {
        const userId = this.getUserId(req);
        return this.forumService.addComment(userId, body);
    }

    @Get(':id/comments')
    @ApiOperation({ summary: 'Ver los comentarios de un post específico' })
    getComments(@Param('id') postId: string) {
        return this.forumService.findCommentsByPost(postId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar un post (Solo el autor)' })
    deletePost(@Param('id') id: string, @Request() req) {
        const userId = this.getUserId(req);
        return this.forumService.deletePost(id, userId);
    }
}
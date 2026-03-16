import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Param,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Query,
    Patch
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestsService } from '../service/request.service';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('requests')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class RequestsController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly requestsService: RequestsService) { }

    // Función auxiliar interna para obtener el ID de forma robusta
    private getUserId(req: any): string {
        return req.user?.userId || req.user?.id || req.user?._id || req.user?.sub;
    }

    @Get('nearby')
    findNearby(
        @Query('lat') lat: number,
        @Query('lng') lng: number,
        @Query('km') km: number = 10
    ) {
        return this.requestsService.findNearby(Number(lat), Number(lng), Number(km));
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(@Req() req, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('La evidencia (foto) es obligatoria');

        const imageResult = await this.cloudinaryService.uploadFile(file);
        const userId = this.getUserId(req);

        if (!userId) throw new BadRequestException('Usuario no identificado');

        return this.requestsService.create(userId, {
            ...body,
            imageUrl: imageResult.secure_url
        });
    }

    @Get('mine')
    findAllMine(@Req() req) {
        const userId = this.getUserId(req);
        return this.requestsService.findAllMyRequests(userId);
    }

    // 1. OBTENER DETALLE SEGURO (Aseguramos el ID correcto)
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req) {
        const userId = this.getUserId(req);
        return this.requestsService.findOneSecure(id, userId);
    }

    @Patch(':id/accept')
    async acceptRequest(@Param('id') id: string, @Req() req) {
        const collectorId = this.getUserId(req);
        return this.requestsService.acceptRequest(id, collectorId);
    }

    // 2. NUEVO: CANCELAR SOLICITUD (Para el ciudadano)
    @Patch(':id/cancel')
    async cancelRequest(@Param('id') id: string, @Req() req) {
        const userId = this.getUserId(req);
        return this.requestsService.cancelRequest(id, userId);
    }

    // 3. NUEVO: FINALIZAR RECOJO (Para el reciclador)
    // Este endpoint es el que debería gatillar la entrega de puntos
    @Patch(':id/complete')
    @UseInterceptors(FileInterceptor('file'))
    async completeRequest(
        @Param('id') id: string,
        @Req() req,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) throw new BadRequestException('La foto de evidencia es obligatoria para finalizar.');

        // 1. Subir la foto a Cloudinary
        const imageResult = await this.cloudinaryService.uploadFile(file);

        // 2. Usar tu función auxiliar para obtener el ID de forma robusta
        const collectorId = this.getUserId(req);

        // 3. Llamar al servicio
        return this.requestsService.completeRequest(id, collectorId, imageResult.secure_url);
    }

    // Mantienes tu upload local si lo usas para pruebas temporales
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return {
            url: `http://192.168.18.9:3000/uploads/${file.filename}`
        };
    }
    @Get('available')
    async findAllAvailable() {
        return this.requestsService.findAllPendingPool();
    }

    @Get('managed')
    async findAllManaged(@Req() req) {
        const userId = this.getUserId(req);
        return this.requestsService.findAllByOfficial(userId);
    }

    @Patch(':id/manage')
    async manageRequest(@Param('id') id: string, @Req() req) {
        const userId = this.getUserId(req);
        return this.requestsService.manageRequest(id, userId);
    }
}
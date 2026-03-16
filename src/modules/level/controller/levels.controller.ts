import { Controller, Get, UseGuards, Req, BadRequestException, NotFoundException } from '@nestjs/common';
import { LevelsService } from '../service/levels.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/modules/users/service/users.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('levels')
export class LevelsController {
    constructor(private readonly levelsService: LevelsService, private readonly usersService: UsersService) { }

    // 1. OBTENER TODOS LOS NIVELES
    // Útil para una pantalla de "Ranking" o "Lista de Niveles"
    @Get()
    async findAll() {
        return this.levelsService.findAll();
    }

    // 2. NUEVO: OBTENER ESTADO ACTUAL DEL USUARIO
    // Ruta: GET /levels/status
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('status')
    async getMyStatus(@Req() req) {
        // 🚨 DEBUG: Imprime req.user para ver EXACTAMENTE qué campos tiene tu token
        console.log("CONTENIDO DEL TOKEN (req.user):", req.user);

        // 1. Extracción robusta (Igual a la de tu RequestsController)
        const userId = req.user?.userId || req.user?.id || req.user?._id || req.user?.sub;

        console.log("ID extraído para buscar:", userId);

        if (!userId) {
            throw new BadRequestException('No se encontró un ID válido en el token.');
        }

        // 2. Buscamos al usuario (findById devuelve null si el ID no existe en DB)
        const user = await this.usersService.findOne(userId);

        if (!user) {
            console.log(`Usuario con ID ${userId} no encontrado en la base de datos.`);
            throw new NotFoundException('Usuario no encontrado');
        }

        const status = await this.levelsService.getLevelStatus(user.current_points);

        // 🚨 IMPORTANTE: Adjuntamos las estadísticas reales de la DB (esas 3 unidades)
        return {
            ...status,
            recyclingStats: user.recyclingStats //
        };
    }


}
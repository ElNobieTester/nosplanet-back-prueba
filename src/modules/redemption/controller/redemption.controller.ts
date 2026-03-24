import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RedemptionsService } from "../service/redemption.service";
import { CreateRedemptionDto } from "../dto/create-redemption.dto";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
    ApiResponse,
    ApiParam,
    ApiBody
} from "@nestjs/swagger";

@ApiTags('Redemptions (Canjes)') // ✅ Agrupa los endpoints en Swagger
@ApiBearerAuth()
@Controller('redemptions')
@UseGuards(AuthGuard('jwt'))
export class RedemptionsController {
    constructor(private readonly service: RedemptionsService) { }

    // ==========================================
    // 1. FLUJO CIUDADANO (APP MÓVIL)
    // ==========================================

    @Post()
    @ApiOperation({
        summary: 'Crear un nuevo canje',
        description: 'Descuenta puntos al usuario y stock al premio, generando un código ECO-XXXX.'
    })
    @ApiBody({ type: CreateRedemptionDto })
    @ApiResponse({ status: 201, description: 'Canje creado con éxito.' })
    @ApiResponse({ status: 400, description: 'Puntos insuficientes o Stock agotado.' })
    @ApiResponse({ status: 404, description: 'Premio no encontrado.' })
    redeem(@Req() req, @Body() createDto: CreateRedemptionDto) {
        // Obtenemos el ID del usuario directamente del Token JWT
        const userId = req.user.sub;
        return this.service.create(userId, createDto);
    }

    // ==========================================
    // 2. FLUJO ADMINISTRADOR (WEB DASHBOARD)
    // ==========================================

    @Patch('validate/:code')
    @ApiOperation({
        summary: 'Validar y entregar premio',
        description: 'Busca un código pendiente y cambia su estado a DELIVERED.'
    })
    @ApiParam({
        name: 'code',
        description: 'El código generado por la app (Ej: ECO-H7A2K)',
        example: 'ECO-A1B2C'
    })
    @ApiResponse({ status: 200, description: 'Premio marcado como entregado correctamente.' })
    @ApiResponse({ status: 404, description: 'El código no existe, expiró o ya fue entregado.' })

    validate(@Param('code') code: string) {
        return this.service.validateAndDeliver(code);
    }


    @Get() // 👈 Añade esto
    @ApiOperation({ summary: 'Obtener todos los canjes' })
    findAll() {
        return this.service.findAll(); // Necesitarás crear este método en el Service
    }

    @Get('search/:code')
    @ApiOperation({ summary: 'Buscar información de un código de canje sin validarlo' })
    @ApiParam({ name: 'code', example: 'ECO-A1B2C' })
    findByCode(@Param('code') code: string) {
        return this.service.findByCode(code);
    }
}
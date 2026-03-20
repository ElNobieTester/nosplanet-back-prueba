import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards, Req } from "@nestjs/common";
import { ProgramsService } from "../service/program.service";
import { CreateProgramDto } from "../dto/create-program.dto";
import { UpdateProgramDto } from "../dto/update-program.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProgramType } from "../enum/progra-type.enum";
import { Program } from "../schema/program.schema";
import { AuthGuard } from "@nestjs/passport";
@ApiTags('Programs')
@Controller('programs')
@UseGuards(AuthGuard('jwt')) // ✅ Protege todas las rutas de este controlador
@ApiBearerAuth()
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) { }

    // ==========================================
    // 1. RUTAS DE LISTADO Y FILTROS
    // ==========================================

    @Get()
    @ApiOperation({ summary: 'Listar todos los programas' })
    async findAll(@Req() req) {
        return this.programsService.findAll(req.user);
    }

    @Get('filter/:programType') // ✅ Las rutas específicas siempre arriba de :id
    @ApiOperation({ summary: 'Listar todos los programas por tipo' })
    @ApiParam({ name: 'programType', enum: ProgramType })
    async findAllProgramType(@Param('programType') programType: ProgramType) {
        return this.programsService.findAllProgramType(programType);
    }

    // ==========================================
    // 2. ACCIONES DEL USUARIO (Join / Leave)
    // ==========================================

    @Post(':id/join')
    @ApiOperation({ summary: 'Unirse a un programa' })
    async join(@Param('id') id: string, @Req() req) {
        // Usamos una extracción segura del ID según tu estrategia JWT
        const userId = req.user.sub || req.user.userId || req.user.id;
        return this.programsService.joinProgram(id, userId);
    }

    @Delete(':id/leave')
    @ApiOperation({ summary: 'Salir de un programa' })
    async leave(@Param('id') id: string, @Req() req) {
        const userId = req.user.sub || req.user.userId || req.user.id;
        return this.programsService.leaveProgram(id, userId);
    }

    // ==========================================
    // 3. GESTIÓN DE PROGRAMAS (CRUD)
    // ==========================================

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo programa ambiental' })
    @ApiResponse({ status: 201, type: Program })
    async create(@Body() createProgramDto: CreateProgramDto, @Req() req) {
        return this.programsService.create(createProgramDto, req.user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un programa' })
    async update(@Param('id') id: string, @Body() program: UpdateProgramDto) {
        return this.programsService.update(id, program);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un programa' })
    async delete(@Param('id') id: string) {
        return this.programsService.remove(id);
    }

    @Get(':id') // ❌ El parámetro genérico :id SIEMPRE al final
    @ApiOperation({ summary: 'Obtener detalle de un programa' })
    findOne(@Param('id') id: string) {
        return this.programsService.findOne(id);
    }
}
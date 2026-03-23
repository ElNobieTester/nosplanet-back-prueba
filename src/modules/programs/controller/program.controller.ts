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
@ApiBearerAuth()
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) { }

    // ==========================================
    // 1. RUTAS PÚBLICAS (Sin protección para Landing)
    // ==========================================

    @Get('public') // ✅ Siempre arriba de las rutas con :id
    @ApiOperation({ summary: 'Listar programas activos para landing (público)' })
    async findPublic() {
        return this.programsService.findAllPublic();
    }

    // ==========================================
    // 2. RUTAS PROTEGIDAS (Requieren Login)
    // ==========================================

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Listar todos los programas (según rol)' })
    async findAll(@Req() req) {
        return this.programsService.findAll(req.user);
    }

    @Get('filter/:programType')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Listar todos los programas por tipo' })
    @ApiParam({ name: 'programType', enum: ProgramType })
    async findAllProgramType(@Param('programType') programType: ProgramType) {
        return this.programsService.findAllProgramType(programType);
    }

    // ==========================================
    // 3. ACCIONES DEL USUARIO (Join / Leave)
    // ==========================================

    @Post(':id/join') // ✅ Unificamos la ruta de Raul y la tuya aquí
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Unirse a un programa ambiental' })
    async join(@Param('id') id: string, @Req() req) {
        // Usamos la extracción segura de ID que ya teníamos
        return this.programsService.joinProgram(id, req.user);
    }

    @Delete(':id/leave')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Salir de un programa' })
    async leave(@Param('id') id: string, @Req() req) {
        return this.programsService.leaveProgram(id, req.user);
    }

    // ==========================================
    // 4. GESTIÓN (CRUD)
    // ==========================================

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Crear un nuevo programa' })
    @ApiBody({ type: CreateProgramDto })
    @ApiResponse({ status: 201, type: Program })
    async create(@Body() createProgramDto: CreateProgramDto, @Req() req) {
        return this.programsService.create(createProgramDto, req.user);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Actualizar un programa' })
    async update(@Param('id') id: string, @Body() program: UpdateProgramDto) {
        return this.programsService.update(id, program);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Eliminar un programa' })
    async delete(@Param('id') id: string) {
        return this.programsService.remove(id);
    }

    @Get(':id') // ❌ El parámetro genérico :id SIEMPRE al final de los @Get
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Obtener detalle de un programa' })
    findOne(@Param('id') id: string) {
        return this.programsService.findOne(id);
    }
}
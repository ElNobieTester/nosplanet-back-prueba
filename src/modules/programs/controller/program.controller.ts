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
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos los programas' })
    async findAll(@Req() req) {
        return this.programsService.findAll(req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/join')
    async join(@Param('id') id: string, @Req() req) {
        const userId = req.user.sub || req.user.id; // Depende de tu JWT
        return this.programsService.joinProgram(id, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id/leave')
    async leave(@Param('id') id: string, @Req() req) {
        const userId = req.user.sub || req.user.id;
        return this.programsService.leaveProgram(id, userId);
    }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo programa ambiental' })
    @ApiBody({ type: CreateProgramDto })
    @ApiResponse({ status: 201, description: 'Programa creado exitosamente', type: Program })
    async create(@Body() createProgramDto: CreateProgramDto, @Req() req) {
        return this.programsService.create(createProgramDto, req.user);
    }

    @Get('filter/:programType')
    @ApiOperation({ summary: 'Listar todos los programas por tipo' })
    @ApiParam({ name: 'programType', description: 'Tipo de programa' })
    async findAllProgramType(@Param('programType') programType: ProgramType) {
        return this.programsService.findAllProgramType(programType);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un programa' })
    @ApiParam({ name: 'id', description: 'ID del programa' })
    @ApiBody({ type: UpdateProgramDto })
    async update(@Param('id') id: string, @Body() program: UpdateProgramDto) {
        return this.programsService.update(id, program);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un programa' })
    @ApiParam({ name: 'id', description: 'ID del programa' })
    async delete(@Param('id') id: string) {
        return this.programsService.remove(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de un programa' })
    findOne(@Param('id') id: string) {
        return this.programsService.findOne(id);
    }
}

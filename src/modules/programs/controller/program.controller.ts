import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards, Req } from "@nestjs/common";
import { ProgramsService } from "../service/program.service";
import { CreateProgramDto } from "../dto/create-program.dto";
import { UpdateProgramDto } from "../dto/update-program.dto";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProgramType } from "../enum/progra-type.enum";
import { Program } from "../schema/program.schema";
import { AuthGuard } from "@nestjs/passport";

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) { }

    @Get('public')
    @ApiOperation({ summary: 'Listar programas activos para landing (público)' })
    async findPublic() {
        return this.programsService.findAllPublic();
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Listar todos los programas' })
    async findAll(@Req() req) {
        return this.programsService.findAll(req.user);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Crear un nuevo programa ambiental' })
    @ApiBody({ type: CreateProgramDto })
    @ApiResponse({ status: 201, description: 'Programa creado exitosamente', type: Program })
    async create(@Body() createProgramDto: CreateProgramDto, @Req() req) {
        return this.programsService.create(createProgramDto, req.user);
    }

    @Get('filter/:programType')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Listar todos los programas por tipo' })
    @ApiParam({ name: 'programType', description: 'Tipo de programa' })
    async findAllProgramType(@Param('programType') programType: ProgramType) {
        return this.programsService.findAllProgramType(programType);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Actualizar un programa' })
    @ApiParam({ name: 'id', description: 'ID del programa' })
    @ApiBody({ type: UpdateProgramDto })
    async update(@Param('id') id: string, @Body() program: UpdateProgramDto) {
        return this.programsService.update(id, program);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Eliminar un programa' })
    @ApiParam({ name: 'id', description: 'ID del programa' })
    async delete(@Param('id') id: string) {
        return this.programsService.remove(id);
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Obtener detalle de un programa' })
    findOne(@Param('id') id: string) {
        return this.programsService.findOne(id);
    }

    @Post('join/:id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Unirse a un programa' })
    join(@Param('id') id: string, @Req() req) {
        return this.programsService.joinProgram(id, req.user);
    }
}

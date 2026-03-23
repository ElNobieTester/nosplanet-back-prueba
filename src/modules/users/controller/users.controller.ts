import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, Patch } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/users.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // ==========================================
    // 1. RUTAS ESTÁTICAS (Sin parámetros :id)
    // ==========================================

    @Post()
    @ApiOperation({ summary: 'Register a new user (Standard)' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile') // ✅ MOVIDO ARRIBA DE :id
    @ApiOperation({ summary: 'Get my own profile (Logged User)' })
    async getMyProfile(@Req() req) {
        // OJO: Asegúrate si es .sub, .id o .userId según tu estrategia JWT
        const userId = req.user.sub || req.user.id || req.user.userId;
        return this.usersService.getProfile(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile') // ✅ MOVIDO ARRIBA DE :id
    @ApiOperation({ summary: 'Update user profile (Name & Phone)' })
    async updateProfile(@Req() req, @Body() body: UpdateProfileDto) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        return this.usersService.updateProfile(userId, body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('update-push-token') // ✅ MOVIDO ARRIBA DE :id
    async updatePushToken(@Req() req, @Body('pushToken') pushToken: string) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        return await this.usersService.update(userId, { pushToken });
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
        const userId = req.user.sub || req.user.id || req.user.userId;
        return this.usersService.updateAvatar(userId, file);
    }

    // ==========================================
    // 2. RUTAS DINÁMICAS (Con parámetros :id)
    // ==========================================

    @Get(':id')
    @ApiOperation({ summary: 'Get user profile by ID' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user by ID (Admin)' })
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.usersService.update(id, updateData);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    @ApiOperation({ summary: 'Change password and clear first-login flag' })
    async changePassword(
        @Req() req,
        @Body() body: { newPassword: string }
    ) {
        return this.usersService.changePassword(req.user.sub, body.newPassword);
    }
}
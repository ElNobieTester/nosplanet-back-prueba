// src/modules/users/controller/users.controller.ts
import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Request, Req, Patch } from '@nestjs/common';
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

    @Get(':id')
    @ApiOperation({ summary: 'Get user profile' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadAvatar(
        @Req() req,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.usersService.updateAvatar(req.user.sub, file);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    @ApiOperation({ summary: 'Update user profile (Name & Phone)' })
    @ApiResponse({ status: 200, description: 'User profile updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateProfile(
        @Req() req,
        @Body() body: UpdateProfileDto
    ) {
        return this.usersService.updateProfile(req.user.sub, body);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user by ID (Admin)' })
    update(@Param('id') id: string, @Body() updateData: any) {
        return this.usersService.update(id, updateData);
    }
    @UseGuards(AuthGuard('jwt')) // Solo usuarios logueados
    @Patch('update-push-token')
    async updatePushToken(@Req() req, @Body('pushToken') pushToken: string) {
        const userId = req.user.userId; // Extraído del JWT

        return await this.usersService.update(userId, { pushToken });
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt')) // Asegúrate de tener protección por JWT
    async getMyProfile(@Req() req) {
        // El ID viene del token JWT decodificado
        const userId = req.user.id;
        return this.usersService.getProfile(userId);
    }
}

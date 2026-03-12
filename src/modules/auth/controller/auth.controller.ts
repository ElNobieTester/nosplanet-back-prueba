import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    DefaultValuePipe,
    ParseIntPipe,
    Patch,
    UploadedFile,
    UseInterceptors,
    Req,
    Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../service/auth.service';
import express from 'express';
import { CreateUserDto } from 'src/modules/users/dto/users.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiBody,
    ApiConsumes,
} from '@nestjs/swagger';
import { LoginUserDto } from 'src/modules/users/dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // 1. Iniciar Login: El usuario toca el botón "Google" en la App
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        // Esto redirige automáticamente a accounts.google.com
    }

    // 2. Callback: Google nos devuelve al usuario aquí
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: express.Response) {
        // 'req.user' viene populated desde GoogleStrategy
        const user = await this.authService.validateGoogleUser(req.user);

        // Generamos el Token propio de nuestra App
        const jwt = await this.authService.generateJwt(user);

        // --- REDIRECCIÓN A LA APP MÓVIL (Deep Linking) ---
        // Cambia la IP por la de tu PC (ipconfig/ifconfig)
        // El puerto 8081 es el default de Expo
        const expoUrl = `exp://192.168.18.9:8081/--/login?token=${jwt.access_token}`;

        // Si ya tienes el build de producción (APK), la URL sería algo como: "recycleapp://login?token=..."

        return res.redirect(expoUrl);
    }


    @Post('forgot-password')
    // 1. Asegúrate de usar @Body() body
    async forgotPassword(@Body() body: { email: string }) {
        console.log('Body recibido:', body); // <--- Agrega esto para depurar

        // 2. Si el body llega vacío, body.email lanzaría el error que ves.
        // Esta validación previene el crash.
        if (!body || !body.email) {
            throw new Error('El email es obligatorio en el cuerpo de la petición');
        }

        return this.authService.forgotPassword(body.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { email: string, code: string, newPassword: string }) {
        return this.authService.resetPassword(body.email, body.code, body.newPassword);
    }

    @Post('register')
    async register(@Body() registerDto: CreateUserDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Login' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Login successful' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid credentials' })

    @ApiBody({ type: LoginUserDto })
    async login(@Body() body: LoginUserDto) {

        return this.authService.login(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('invite-manager')
    async inviteManager(@Body() body: { email: string }) {
        return this.authService.inviteManager(body.email);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('check-status')
    async checkAuthStatus(@Req() req) {
        return this.authService.checkAuthStatus(req.user);
    }
}
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module'; // Importamos UsersModule\
import { JwtStrategy } from './strategies/jwt.strategy';
import { LevelsModule } from '../level/levels.module';
import { CoordinatorsModule } from '../coordinators/coordinators.module';

@Module({
    imports: [
        UsersModule, // Necesario para usar UsersService
        CoordinatorsModule,
        PassportModule,
        LevelsModule,
        // Configuración dinámica de JWT usando variables de entorno
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, GoogleStrategy, JwtStrategy],
    exports: [AuthService, JwtStrategy],
})
export class AuthModule { }
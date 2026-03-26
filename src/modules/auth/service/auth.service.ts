import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/service/users.service';
import { UserRole } from '../../users/enum/userRole.enum';
import { UserDocument } from 'src/modules/users/schema/users.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/modules/users/dto/users.dto';
import { LevelsService } from 'src/modules/level/service/levels.service';
import { CoordinatorsService } from '../../coordinators/service/coordinators.service';
import { EmailService } from '../../../common/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly levelsService: LevelsService,
    private readonly coordinatorsService: CoordinatorsService,
    private readonly emailService: EmailService,
  ) { }

  async inviteCoordinator(email: string, managerId: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Este correo ya está registrado en la plataforma.');
    }

    const invitationToken = this.jwtService.sign(
      { email, type: 'invitation', role: 'COORDINATOR', managerId },
      { expiresIn: '48h' }
    );

    const inviteUrl = `http://localhost:5173/auth/onboarding/${invitationToken}`;
    await this.emailService.sendCoordinatorInvitation(email, inviteUrl);
    return { success: true, message: 'Invitación enviada con éxito' };
  }

  async inviteManager(email: string) {
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Este usuario ya está registrado en la plataforma.');
    }

    const invitationToken = this.jwtService.sign(
      { email, type: 'invitation', role: UserRole.MANAGER },
      { expiresIn: '48h' }
    );

    const inviteUrl = `http://localhost:5173/auth/onboarding/${invitationToken}`;
    await this.emailService.sendManagerInvitation(email, inviteUrl);
    return { success: true, message: 'Invitación enviada con éxito' };
  }

  async register(userDto: CreateUserDto) {
    const existingUser = await this.usersService.findOneByEmail(userDto.email);
    if (existingUser) throw new BadRequestException('El correo ya está registrado en la plataforma');

    try {
      const newUser = await this.usersService.create({
        ...userDto,
        authProvider: userDto.authProvider || 'local',
        role: (userDto.role || UserRole.CITIZEN) as UserRole,
      });

      this.emailService.sendWelcomeEmail(newUser.email, newUser.fullName);
      return this.generateJwt(newUser, newUser.role === UserRole.COORDINATOR);
    } catch (error) {
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }

  async login(loginData: { email: string; password: string }) {
    const user = await this.usersService.findOneByEmail(loginData.email);

    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.password) throw new UnauthorizedException('Inicia sesión con Google o usa tu contraseña asignada');

    const isMatch = await bcrypt.compare(loginData.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    return this.generateJwt(user, user.role === UserRole.COORDINATOR);
  }

  async validateGoogleUser(googleUser: any) {
    const user = await this.usersService.findOneByEmail(googleUser.email);
    if (user) return user;

    try {
      const newUser = await this.usersService.create({
        email: googleUser.email,
        fullName: `${googleUser.firstName} ${googleUser.lastName}`,
        googleId: googleUser.googleId,
        avatarUrl: googleUser.picture,
        authProvider: 'google',
        role: UserRole.CITIZEN,
      });
      this.emailService.sendWelcomeEmail(newUser.email, newUser.fullName);
      return newUser;
    } catch (error) {
      throw new InternalServerErrorException('Error creando usuario de Google');
    }
  }

  async generateJwt(user: any, isCoordinator: boolean = false) {
    const profile = user.profile || {};
    const currentPoints = profile.current_points || 0;
    const gamification = await this.levelsService.getLevelStatus(currentPoints);

    const payload = { sub: user._id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        uid: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatar: user.avatarUrl,
        phone: user.phone,
        institution: profile.institution || null,
        managerId: isCoordinator ? user.managerId : undefined,
        programs: isCoordinator ? user.programs : undefined,

        programsParticipating: user.programsParticipating || [],
        gamification,
        membershipTier: profile.membershipTier || 'NONE',
        points: currentPoints,
        needsPasswordChange: user.needsPasswordChange || false,
      }
    };
  }

  async forgotPassword(email: string, platform: 'web' | 'mobile' = 'web') {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    await this.usersService.update(user._id.toString(), {
      resetPasswordToken: code,
      resetPasswordExpires: expires
    });

    const resetUrl = `http://localhost:5174/auth/reset-password?email=${email}&code=${code}`;
    await this.emailService.sendPasswordReset(email, user.fullName, resetUrl, code, platform);

    return { message: 'Correo enviado' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || user.resetPasswordToken !== code) throw new BadRequestException('Código inválido');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Éxito' };
  }

  async checkAuthStatus(userPayload: any) {
    const dbUser = await this.usersService.findOne(userPayload.sub || userPayload._id) as any;

    if (!dbUser) throw new UnauthorizedException('Usuario no encontrado');
    return this.generateJwt(dbUser, dbUser.role === UserRole.COORDINATOR);
  }
}
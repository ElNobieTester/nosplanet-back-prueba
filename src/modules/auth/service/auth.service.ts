import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/service/users.service';
import { UserRole } from '../../users/enum/userRole.enum';
import { UserDocument } from 'src/modules/users/schema/users.schema';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/modules/users/dto/users.dto';
import { LevelsService } from 'src/modules/level/service/levels.service';

@Injectable()
export class AuthService {
  private transporter;
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly levelsService: LevelsService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  private async sendManagerInvitation(email: string, token: string) {
    const inviteUrl = `http://localhost:5174/auth/onboarding/${token}`;
    const year = new Date().getFullYear();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitación Oficial Gestor - Nos Planet</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f0f4f8; padding-bottom: 40px; }
          .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1e293b; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #016d4d 0%, #018f64 100%); padding: 60px 40px; text-align: center; position: relative; }
          .logo-text { color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1.5px; margin: 0; }
          .logo-dot { color: #4ade80; }
          .badge { background-color: rgba(255, 255, 255, 0.15); color: #ffffff; padding: 8px 20px; border-radius: 100px; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; display: inline-block; margin-bottom: 15px; border: 1px solid rgba(255, 255, 255, 0.3); }
          .content { padding: 50px 50px 40px 50px; text-align: center; }
          .title { font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 20px 0; line-height: 1.1; letter-spacing: -1px; }
          .text { font-size: 16px; line-height: 1.7; color: #475569; margin-bottom: 35px; }
          .highlight { color: #018f64; font-weight: 800; }
          .cta-button { background: #018f64; color: #ffffff !important; padding: 22px 45px; border-radius: 20px; font-weight: 900; text-decoration: none; display: inline-block; font-size: 16px; letter-spacing: 1px; box-shadow: 0 10px 30px rgba(1, 143, 100, 0.3); transition: transform 0.3s; }
          .footer { background-color: #0f172a; padding: 40px; text-align: center; color: #94a3b8; }
          .footer-text { font-size: 12px; margin: 0; line-height: 1.5; letter-spacing: 0.5px; }
          .divider { height: 1px; background-color: #f1f5f9; margin: 40px 0; }
          @media screen and (max-width: 600px) {
            .content { padding: 40px 30px; }
            .title { font-size: 26px; }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <table class="main" width="100%">
            <tr>
              <td class="header">
                <div class="badge">Oficial Partner</div>
                <h1 class="logo-text">Nos Planet<span class="logo-dot">.</span></h1>
              </td>
            </tr>
            <tr>
              <td class="content">
                <h2 class="title">¡Es hora de liderar el <span style="color: #018f64;">cambio</span>!</h2>
                <p class="text">
                  Hola,<br><br>
                  Has sido seleccionado para unirte como <span class="highlight">Gestor Estratégico</span> en la plataforma oficial de <strong>Nos Planet</strong>. 
                  Tu rol es fundamental para coordinar esfuerzos, potenciar programas de reciclaje y transformar positivamente tu institución.
                </p>
                <div style="margin: 40px 0;">
                  <a href="${inviteUrl}" class="cta-button">ACEPTAR INVITACIÓN Y UNIRME</a>
                </div>
                <div class="divider"></div>
                <p style="font-size: 13px; color: #94a3b8; font-style: italic; margin: 0;">
                  Este enlace de seguridad es exclusivo para ti y expirará en un periodo de 48 horas por protección de datos.
                </p>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p class="footer-text">
                  <strong>Nos Planet SAC</strong><br>
                  Liderando la economía circular en la región.<br><br>
                  &copy; ${year} Recycle App · Todos los derechos reservados.
                </p>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: '"Liderazgo Nos Planet 🌿" <prastillec@gmail.com>',
      to: email,
      subject: '🌿 Invitación Exclusiva: Únete al equipo de Gestión Nos Planet',
      html: htmlContent,
    });
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

    await this.sendManagerInvitation(email, invitationToken);
    return { success: true, message: 'Invitación enviada con éxito' };
  }

  private async sendWelcomeEmail(email: string, name: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body, table, td, h1, h2, p, div { font-family: 'Segoe UI', Arial, sans-serif !important; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="background-color: #018f64; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900;">¡Bienvenido a Recycle! 🌿</h1>
          </div>
          <div style="padding: 40px; text-align: center; color: #1e293b;">
            <h2 style="color: #018f64; margin-top: 0;">¡Hola, ${name}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
              Estamos muy felices de que te unas a Nos Planet. Has dado el primer paso para transformar el mundo.
            </p>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
                <p style="margin: 0; font-weight: 800; font-size: 16px; color: #018f64; font-style: italic;">
                    "Pequeñas acciones, grandes cambios."
                </p>
            </div>
          </div>
          <div style="background-color: #0f172a; color: #94a3b8; padding: 15px; text-align: center; font-size: 11px;">
            &copy; ${new Date().getFullYear()} Recycle · Juntos limpiamos el planeta.
          </div>
        </div>
      </body>
      </html>
    `;

    this.transporter.sendMail({
      from: '"Familia Recycle ♻️" <prastillec@gmail.com>',
      to: email,
      subject: '¡Bienvenido! Tu viaje ecológico comienza hoy 🌱',
      html: htmlContent,
    }).catch(e => console.error('Error welcome email:', e));
  }

  async register(userDto: CreateUserDto) {
    const existingUser = await this.usersService.findOneByEmail(userDto.email);
    if (existingUser) throw new BadRequestException('El correo ya está registrado');

    try {
      const newUser = await this.usersService.create({
        ...userDto,
        authProvider: userDto.authProvider || 'local',
        role: userDto.role || UserRole.CITIZEN,
      });
      this.sendWelcomeEmail(newUser.email, newUser.fullName);
      return this.generateJwt(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }

  async login(loginData: { email: string; password: string }) {
    const user = await this.usersService.findOneByEmail(loginData.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.password) throw new UnauthorizedException('Inicia sesión con Google');

    const isMatch = await bcrypt.compare(loginData.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    return this.generateJwt(user);
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
      this.sendWelcomeEmail(newUser.email, newUser.fullName);
      return newUser;
    } catch (error) {
      throw new InternalServerErrorException('Error creando usuario de Google');
    }
  }

  async generateJwt(user: any) {
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

    const htmlWeb = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #070707; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .wrapper { padding: 40px 20px; text-align: center; }
          .container { max-width: 480px; margin: 0 auto; background: #111827; border-radius: 32px; padding: 50px 40px; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
          .title { font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; margin-bottom: 8px; text-transform: uppercase; font-style: italic; }
          .subtitle { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 30px; line-height: 1.6; }
          .user-name { color: #018f64; font-weight: 800; }
          .btn { background-color: #018f64; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-size: 13px; font-weight: 900; display: inline-block; letter-spacing: 0.1em; transition: all 0.3s ease; box-shadow: 0 10px 20px rgba(1, 143, 100, 0.2); }
          .footer { margin-top: 40px; color: rgba(255,255,255,0.2); font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; }
          .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 30px auto; width: 60px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <h1 class="title">Recuperar Acceso</h1>
            <p class="subtitle">
              Hola <span class="user-name">${user.fullName}</span>,<br>
              Has solicitado acceso para restablecer tu contraseña. Haz clic en el botón inferior para continuar:
            </p>
            
            <a href="${resetUrl}" class="btn">RESTABLECER CONTRASEÑA</a>

            <div class="divider"></div>
            
            <div class="footer">Nos Planet SAC &copy; ${new Date().getFullYear()}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const htmlMobile = `
       <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center; border: 1px solid #eee; border-radius: 20px; padding: 40px;">
          <h2 style="color: #018f64;">Código de Seguridad</h2>
          <p>Usa este código en la aplicación móvil para validar tu identidad:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; margin: 30px 0; color: #1e293b;">${code}</div>
          <p style="font-size: 12px; color: #ef4444;">Válido por 15 minutos.</p>
       </div>
    `;

    await this.transporter.sendMail({
      from: '"Seguridad Recycle" <prastillec@gmail.com>',
      to: email,
      subject: platform === 'web' ? '🔐 Restablece tu contraseña - Recycle Web' : '📱 Tu código de seguridad - Recycle App',
      html: platform === 'web' ? htmlWeb : htmlMobile,
    });

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
    const dbUser = await this.usersService.findOne(userPayload.sub || userPayload._id);
    if (!dbUser) throw new UnauthorizedException('Usuario no encontrado');
    return this.generateJwt(dbUser);
  }
}
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendThankYouEmail(to: string, data: { payerName: string; amount: number; membershipTier: string }) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #052e16;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #052e16; padding: 60px 20px;">
    <tr>
      <td align="center">
        <!-- Tarjeta Principal -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.6);">
          <!-- Header Verde Eco -->
          <tr>
            <td style="background: linear-gradient(160deg, #16a34a 0%, #052e16 100%); padding: 50px 40px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="margin-bottom: 16px;">
               <div style="margin-bottom: 16px; font-size:48px; line-height:1;">🌿</div>
              </div>
              <div style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 24px;">Recycle</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Gracias por tu Donación</h1>
              <p style="color: #bbf7d0; margin: 12px 0 0 0; font-size: 15px; font-weight: 500;">Tu acción hoy ayuda a construir un planeta más sostenible.</p>
            </td>
          </tr>
          <!-- Cuerpo -->
          <tr>
            <td style="padding: 48px 40px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #052e16; font-weight: 600; margin: 0 0 16px 0;">Hola ${data.payerName},</p>
              <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 24px 0;">
                Queremos agradecerte sinceramente por tu valiosa donación a <strong>Recycle</strong>. 
                Gracias a personas comprometidas como tú, podemos seguir impulsando iniciativas que promueven el reciclaje, la educación ambiental y la protección de nuestro entorno.
              </p>
              <p style="font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 32px 0;">
                Cada aporte, sin importar el tamaño, genera un impacto real. 
                Hoy has contribuido de manera significativa al desarrollo de un futuro más limpio y responsable para todos.
              </p>
              <div style="margin-top: 40px; padding: 24px; background-color: #f0fdf4; border-radius: 20px; text-align: center;">
                <p style="font-size: 14px; color: #166534; margin: 0; line-height: 1.6;"><strong>"El cambio comienza con pequeñas acciones que, juntas, transforman el mundo."</strong></p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #ffffff; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">&copy; 2026 Recycle &bull; Comprometidos con el Planeta</p>
            </td>
          </tr>
        </table>
        <!-- Nota final -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin-top: 24px;">
          <tr><td align="center"><p style="font-size: 12px; color: #bbf7d0;">Gracias por ser parte activa del cambio sostenible.</p></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const mailOptions = {
      from: '"Recycle App" <recycleapp@gmail.com>',
      to,
      subject: '💚 Gracias por tu Donación - Recycle App',
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`📧 Email de agradecimiento enviado exitosamente a ${to}`);
    } catch (error: any) {
      this.logger.error(`❌ Error enviando email de agradecimiento: ${error.message}`);
    }
  }

  async sendOTPEmail(to: string, name: string, otp: string) {
    const year = new Date().getFullYear();
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1F2937; margin: 0; padding: 0; background-color: #F3F4F6; }
        .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #018f64 0%, #00d084 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .code-box { background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border: 3px solid #018f64; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center; }
        .code { font-size: 56px; font-weight: 900; color: #018f64; letter-spacing: 16px; font-family: 'Courier New', monospace; }
        .footer { background: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>🔐 Código de Verificación</h1></div>
        <div class="content">
            <p style="font-size: 18px;">Hola <strong>${name}</strong>,</p>
            <p>Has solicitado activar la <strong>verificación en 2 pasos</strong> en Recycle App. Ingresa el siguiente código:</p>
            <div class="code-box">
                <div style="font-size: 14px; color: #047857; font-weight: 600; text-transform: uppercase;">Tu Código de Seguridad</div>
                <div class="code">${otp}</div>
                <p style="color: #059669; font-weight: 600;">⏰ Válido por 10 minutos</p>
            </div>
            <p style="color: #6B7280; font-size: 14px; text-align: center;">Si no solicitaste este código, ignora este mensaje. Tu cuenta permanece protegida.</p>
        </div>
        <div class="footer">
            <p style="color: #9CA3AF; font-size: 13px;">&copy; ${year} Recycle App - Juntos por un planeta más limpio 🌱</p>
        </div>
    </div>
</body>
</html>`;

    await this.transporter.sendMail({
      from: '"Recycle App" <recycleapp@gmail.com>',
      to,
      subject: '🔐 Código de Verificación - Recycle App',
      html,
    });
    this.logger.log(`📧 OTP enviado exitosamente a ${to}`);
  }

  async sendSuspensionEmail(to: string, name: string, suspensionDate: Date) {
    const year = new Date().getFullYear();
    const deletionDate = new Date(suspensionDate);
    deletionDate.setDate(deletionDate.getDate() + 30);
    const deletionDateFormatted = deletionDate.toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: sans-serif; color: #1F2937; background-color: #F3F4F6; margin: 0; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ Cuenta Suspendida</h1>
        </div>
        <div style="padding: 40px;">
            <p style="font-size: 18px;">Hola <strong>${name}</strong>,</p>
            <p>Tu cuenta de <strong>Recycle App</strong> ha sido suspendida temporalmente según tu solicitud.</p>
            <div style="background-color: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
                <div style="font-size: 12px; color: #92400E; font-weight: bold; text-transform: uppercase;">Período de Gracia</div>
                <div style="font-size: 40px; font-weight: 900; color: #D97706; margin: 10px 0;">30 días</div>
                <p style="color: #DC2626; font-weight: bold; margin: 0;">📅 Eliminación: ${deletionDateFormatted}</p>
            </div>
            <p style="font-size: 14px; color: #6B7280;">Puedes restaurar tu cuenta iniciando sesión en cualquier momento durante los próximos 30 días.</p>
        </div>
        <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">&copy; ${year} Recycle App</p>
        </div>
    </div>
</body>
</html>`;

    await this.transporter.sendMail({
      from: '"Recycle App" <recycleapp@gmail.com>',
      to,
      subject: '⚠️ Cuenta Suspendida Temporalmente - Recycle App',
      html,
    });
    this.logger.log(`📧 Notificación de suspensión enviada a ${to}`);
  }

  // ====================================================================
  // NUEVAS PLANTILLAS DESDE AUTHSERVICE (UNIFICACIÓN)
  // ====================================================================

  async sendWelcomeEmail(to: string, name: string) {
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

    await this.transporter.sendMail({
      from: '"Recycle App" <recycleapp@gmail.com>',
      to,
      subject: '¡Bienvenido! Tu viaje ecológico comienza hoy 🌱',
      html: htmlContent,
    });
  }

  async sendCoordinatorInvitation(to: string, inviteUrl: string) {
    const year = new Date().getFullYear();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitación Oficial Coordinador - Nos Planet</title>
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
          .cta-button { background: #018f64; color: #ffffff !important; padding: 22px 45px; border-radius: 20px; font-weight: 900; text-decoration: none; display: inline-block; font-size: 16px; letter-spacing: 1px; box-shadow: 0 10px 30px rgba(1, 143, 100, 0.3); }
          .footer { background-color: #0f172a; padding: 40px; text-align: center; color: #94a3b8; }
          .footer-text { font-size: 12px; margin: 0; line-height: 1.5; letter-spacing: 0.5px; }
          .divider { height: 1px; background-color: #f1f5f9; margin: 40px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <table class="main" width="100%">
            <tr>
              <td class="header">
                <div class="badge">Team Member</div>
                <h1 class="logo-text">Nos Planet<span class="logo-dot">.</span></h1>
              </td>
            </tr>
            <tr>
              <td class="content">
                <h2 class="title">¡Únete a la <span style="color: #018f64;">acción</span>!</h2>
                <p class="text">
                  Hola,<br><br>
                  Has sido invitado para unirte como <span class="highlight">Coordinador Operativo</span> en la red oficial de <strong>Nos Planet</strong>. 
                  Como coordinador, serás la pieza clave para ejecutar programas, realizar pruebas y asegurar el éxito del impacto ambiental en tu zona.
                </p>
                <div style="margin: 40px 0;">
                  <a href="${inviteUrl}" class="cta-button">COMPLETAR MI REGISTRO</a>
                </div>
                <div class="divider"></div>
                <p style="font-size: 13px; color: #94a3b8; font-style: italic; margin: 0;">
                  Este enlace de seguridad es exclusivo para ti y expirará en un periodo de 48 horas.
                </p>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p class="footer-text">
                  <strong>Nos Planet SAC</strong><br>
                  Transformando residuos en recursos.<br><br>
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
      from: '"Recycle App" <recycleapp@gmail.com>',
      to,
      subject: '🌿 Invitación: Únete como Coordinador a Nos Planet',
      html: htmlContent,
    });
  }

  async sendManagerInvitation(to: string, inviteUrl: string) {
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
          .cta-button { background: #018f64; color: #ffffff !important; padding: 22px 45px; border-radius: 20px; font-weight: 900; text-decoration: none; display: inline-block; font-size: 16px; letter-spacing: 1px; box-shadow: 0 10px 30px rgba(1, 143, 100, 0.3); }
          .footer { background-color: #0f172a; padding: 40px; text-align: center; color: #94a3b8; }
          .footer-text { font-size: 12px; margin: 0; line-height: 1.5; letter-spacing: 0.5px; }
          .divider { height: 1px; background-color: #f1f5f9; margin: 40px 0; }
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
      from: '"Recycle App" <recycleapp@gmail.com>',
      to,
      subject: '🌿 Invitación Exclusiva: Únete al equipo de Gestión Nos Planet',
      html: htmlContent,
    });
  }

  async sendPasswordReset(to: string, userName: string, resetUrl: string, code: string, platform: 'web' | 'mobile' = 'web') {
    const year = new Date().getFullYear();
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
          .btn { background-color: #018f64; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-size: 13px; font-weight: 900; display: inline-block; letter-spacing: 0.1em; box-shadow: 0 10px 20px rgba(1, 143, 100, 0.2); }
          .footer { margin-top: 40px; color: rgba(255,255,255,0.2); font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; }
          .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 30px auto; width: 60px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <h1 class="title">Recuperar Acceso</h1>
            <p class="subtitle">
              Hola <span class="user-name">${userName}</span>,<br>
              Has solicitado acceso para restablecer tu contraseña. Haz clic en el botón inferior para continuar:
            </p>
            <a href="${resetUrl}" class="btn">RESTABLECER CONTRASEÑA</a>
            <div class="divider"></div>
            <div class="footer">Nos Planet SAC &copy; ${year}</div>
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
      from: '"Recycle App" <recycleapp@gmail.com>',
      to,
      subject: platform === 'web' ? '🔐 Restablece tu contraseña - Recycle Web' : '📱 Tu código de seguridad - Recycle App',
      html: platform === 'web' ? htmlWeb : htmlMobile,
    });
  }
}

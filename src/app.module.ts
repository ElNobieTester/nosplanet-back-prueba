import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // <--- 1. IMPORTANTE: Importar esto
import { CloudinaryModule } from './common/cloudinary.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

import { InductionModule } from './modules/induction/induction.module';
import { PartnersModule } from './modules/partners/partners.module';
import { LevelsModule } from './modules/level/levels.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { RewardsModule } from './modules/reward/reward.module';
import { ForumModule } from './modules/forum/forum.module';
import { RequestModule } from './modules/request/request.module';
import { EcoHistoryModule } from './modules/eco-histories/eco-history.module';
import { DonationsModule } from './donations/donations.module';
import { ContactModule } from './modules/contact/contact.module';
import { CoordinatorsModule } from './modules/coordinators/coordinators.module';
import { RedemptionsModule } from './modules/redemption/redemption.module';

@Module({
  imports: [
    // 2. IMPORTANTE: Esto carga el archivo .env antes que todo lo demás
    ConfigModule.forRoot({
      isGlobal: true, // Esto hace que funcione en todos tus módulos (Auth, Users, etc.) sin reimportarlo
    }),

    // Ahora sí leerá process.env.MONGO_URI correctamente del archivo .env
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/NosPlanetInfo'),
    CloudinaryModule,
    UsersModule,
    AuthModule,
    RedemptionsModule,
    CoordinatorsModule,
    LevelsModule,
    InductionModule,
    PartnersModule,
    ProgramsModule,
    RewardsModule,
    ForumModule,
    RequestModule,
    EcoHistoryModule,
    DonationsModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
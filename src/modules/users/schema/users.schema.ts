import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Transform } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../enum/userRole.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User {
    // --- DATOS DE IDENTIDAD (Comunes) ---
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, unique: true })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @Prop({ default: 'local' }) // 'local' o 'google'
    authProvider: string;

    @Prop({ enum: UserRole, default: UserRole.CITIZEN })
    role: string;

    @Prop({ required: false })
    password?: string;

    @Prop({
        unique: true,
        sparse: true,
        type: String,
        set: (val: string) => (val === '' ? undefined : val)
    })
    documentNumber: string;

    @Prop({
        unique: true,
        sparse: true,
        type: String,
        set: (val: string) => (val === '' ? undefined : val)
    })
    phone: string;

    @Prop({ required: false })
    avatarUrl?: string;

    @Prop({
        unique: true,
        sparse: true,
        type: String,
        set: (val: string) => (val === '' ? undefined : val)
    })
    googleId: string;

    // --- ESTADO DE CUENTA ---
    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: String, default: null })
    resetPasswordToken: string | null;


    @Prop({ type: Date, default: null })
    resetPasswordExpires: Date | null;

    @Prop({ type: String, default: null })
    pushToken: string; //

    @Prop({ type: [String], default: [] })
    completedInductions: string[];

    @Prop({ default: false })
    needsPasswordChange: boolean;

    @Prop({ type: [{ type: String, ref: 'Program' }], default: [] })
    programsParticipating: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

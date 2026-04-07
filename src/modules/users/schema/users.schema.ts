import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../enum/userRole.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, unique: true })
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @Prop({ enum: UserRole, default: UserRole.CITIZEN })
    role: string;

    // Ahora es requerido ya que no hay Google Auth
    @Prop({ required: true })
    password?: string;

    // --- UBICACIÓN PARA ANÁLISIS DE DATOS ---
    @Prop({ required: true, index: true }) // index: true facilita el análisis posterior
    department: string;

    @Prop({ required: true, index: true })
    district: string;

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

    // --- ESTADO DE CUENTA ---
    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: String, default: null })
    resetPasswordToken: string | null;

    @Prop({ type: Date, default: null })
    resetPasswordExpires: Date | null;

    @Prop({ type: String, default: null })
    pushToken: string;

    @Prop({ type: [String], default: [] })
    completedInductions: string[];

    @Prop({ default: false })
    needsPasswordChange: boolean;

    @Prop({ type: [{ type: String, ref: 'Program' }], default: [] })
    programsParticipating: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
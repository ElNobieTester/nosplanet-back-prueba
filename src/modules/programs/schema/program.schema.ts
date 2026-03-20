import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProgramType } from '../enum/progra-type.enum';

export type ProgramDocument = Program & Document;

@Schema({ _id: false }) // Sub-esquema para el contacto (no necesita ID propio)
class ContactInfo {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: false })
    website: string;
}

@Schema({ timestamps: true }) // Agrega createdAt y updatedAt automáticamente
export class Program {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true })
    organization: string;

    @Prop({ required: true, enum: ProgramType })
    organizationType: ProgramType;

    @Prop({ default: 0 })
    participants: number;

    @Prop({ required: true })
    location: string;

    @Prop({ required: true })
    duration: string;

    @Prop({ required: true, min: 0 })
    points: number; // Puntos de gamificación

    @Prop({ required: false }) // Será la URL de Cloudinary
    imageUrl: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: [String], default: [] })
    objectives: string[];

    @Prop({ type: [String], default: [] })
    activities: string[];

    @Prop({ type: ContactInfo, required: true })
    contact: ContactInfo;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: String, default: null })
    institution: string;

    @Prop({ type: String, ref: 'User', default: null })
    managedBy: string;

    @Prop({ required: false })
    date: string;

    @Prop({ required: false, default: 'PROYECTO' })
    category: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    participantsObj: Types.ObjectId[];
}

export const ProgramSchema = SchemaFactory.createForClass(Program);
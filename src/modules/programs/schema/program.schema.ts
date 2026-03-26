import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ProgramType } from '../enum/progra-type.enum';

export type ProgramDocument = Program & Document;

@Schema({ _id: false })
class LogEntry {
    @Prop({ type: String, ref: 'User' })
    userId: string;

    @Prop({ default: Date.now })
    at: Date;
}

@Schema({ _id: false })
class LocationInfo {
    @Prop({ required: true, trim: true })
    name: string; // Ej: "Parque Central de Miraflores" o "Aula Magna"

    @Prop({ required: false })
    mapUrl: string; // Ej: Link de Google Maps o link de Zoom
}

@Schema({ _id: false })
class ContactInfo {
    @Prop({ required: false })
    email: string;

    @Prop({ required: false })
    phone: string;

    @Prop({ required: false })
    website: string;
}

@Schema({ timestamps: true })
export class Program {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true })
    organization: string;

    @Prop({ required: true, enum: ProgramType })
    organizationType: ProgramType;

    @Prop({ default: 0 })
    participants: number;

    // --- CAMBIO: Ahora es de tipo LocationInfo ---
    @Prop({ type: LocationInfo, required: true })
    location: LocationInfo;

    @Prop({ required: true })
    duration: string;

    @Prop({ required: true, min: 0 })
    points: number;

    @Prop({ required: false })
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

    @Prop({ type: String, default: '' })
    indications: string;

    @Prop({ type: [LogEntry], default: [] })
    participantList: LogEntry[];

    @Prop({ type: [LogEntry], default: [] })
    attendedList: LogEntry[];

    @Prop({ type: [{ type: String, ref: 'User' }], default: [] })
    coordinatorList: string[];
}
export const ProgramSchema = SchemaFactory.createForClass(Program);
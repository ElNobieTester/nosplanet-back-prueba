
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InductionDocument = Induction & Document;

@Schema({ timestamps: true })
export class Induction {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, enum: ['Tutorial', 'Reciclaje', 'Eco-Tips', 'Premios'] })
    category: string;

    @Prop({ required: true })
    duration: string;

    @Prop({ required: true, default: 0 })
    views: number;

    @Prop({ required: true, default: 0 })
    ecoPoints: number; // Unificamos xpPoints y completionXP aquí

    @Prop({ required: true })
    videoUrl: string;

    @Prop({ required: true })
    description: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const InductionSchema = SchemaFactory.createForClass(Induction);

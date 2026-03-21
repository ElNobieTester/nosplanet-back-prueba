import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

export enum ContactStatus {
    PENDING = 'PENDING',
    READ = 'READ',
    REPLIED = 'REPLIED',
    ARCHIVED = 'ARCHIVED',
    TRASH = 'TRASH',
}

@Schema({ timestamps: true })
export class Contact {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    message: string;

    @Prop({ default: ContactStatus.PENDING, enum: ContactStatus })
    status: string;

    @Prop({ required: false })
    role?: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

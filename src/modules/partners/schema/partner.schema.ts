
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PartnerDocument = Partner & Document;

@Schema()
export class PartnerImpact {
    @Prop()
    icon: string;

    @Prop()
    value: string;

    @Prop()
    label: string;
}

@Schema({ timestamps: true })
export class Partner {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: ['financial', 'government', 'ong', 'corporate', 'all'] })
    filterType: string;

    @Prop({ required: true })
    typeLabel: string; // 'Fintech', 'Banco', etc.

    @Prop({ required: true })
    logo: string; // URL Image

    @Prop({ required: true })
    mainColor: string; // Hex Code

    @Prop({ required: true })
    description: string;

    @Prop({ required: true }) // Kept as requested
    environmentalCommitment: string;

    @Prop({ default: 0 })
    rewardsCount: number;

    @Prop({ default: 0 })
    usersCount: number;

    @Prop({ default: false })
    isPinned: boolean;

    @Prop({ default: false })
    isVisible: boolean; // Controls visibility on Landing Page

    @Prop({ default: false })
    isLocked: boolean; // If true, requires editing before it can be visible

    @Prop()
    websiteUrl: string;
}

export const PartnerSchema = SchemaFactory.createForClass(Partner);

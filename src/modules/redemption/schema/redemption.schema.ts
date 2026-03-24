import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RedemptionDocument = Redemption & Document;

@Schema({ timestamps: true })
export class Redemption {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Reward', required: true })
    rewardId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    redemptionCode: string; // Ejemplo: ECO-X821

    @Prop({
        required: true,
        enum: ['PENDING', 'DELIVERED', 'EXPIRED'],
        default: 'PENDING'
    })
    status: string;

    @Prop()
    deliveredAt: Date;
}

export const RedemptionSchema = SchemaFactory.createForClass(Redemption);
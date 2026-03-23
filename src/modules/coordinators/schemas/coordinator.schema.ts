import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CoordinatorDocument = HydratedDocument<Coordinator>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Coordinator {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    managerId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Program' }], default: [] })
    programs: Types.ObjectId[];
}

export const CoordinatorSchema = SchemaFactory.createForClass(Coordinator);

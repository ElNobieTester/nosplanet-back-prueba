import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ForumCategory } from '../enum/forum-category.enum';

@Schema({ timestamps: true })
export class ForumPost extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: String, enum: ForumCategory, default: ForumCategory.GENERAL })
    category: ForumCategory;

    // 📸 EL NUEVO CAMPO:
    // Lo ponemos como opcional (no requerido) para que los usuarios 
    // puedan publicar solo texto si lo prefieren.
    @Prop({ required: false })
    imageUrl?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    likes: Types.ObjectId[];

    @Prop({ default: 0 })
    commentsCount: number;
}

export const ForumPostSchema = SchemaFactory.createForClass(ForumPost);
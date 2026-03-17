import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ForumPost } from '../schema/forum-post.schema';
import { ForumComment } from '../schema/forum-comment.schema';

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(ForumPost.name) private postModel: Model<ForumPost>,
        @InjectModel(ForumComment.name) private commentModel: Model<ForumComment>,
    ) { }

    async create(createPostDto: any, userId: string) {
        // Destructuramos los datos que vienen del controller
        const { title, content, category, imageUrl } = createPostDto;

        const newPost = new this.postModel({
            title,
            content,
            category,
            imageUrl: imageUrl || null, // 📸 Se guarda solo si el usuario subió algo
            author: new Types.ObjectId(userId),
            likes: [],
            commentsCount: 0,
        });

        const savedPost = await newPost.save();

        // Devolvemos el post con el autor ya poblado para el frontend
        return savedPost.populate('author', 'fullName avatarUrl');
    }

    // Obtener feed con datos del autor (Nombre y Avatar)
    async findAll() {
        return this.postModel
            .find()
            .populate('author', 'fullName avatarUrl') // Trae solo lo necesario del User
            .sort({ createdAt: -1 }) // Los más nuevos primero
            .exec();
    }

    async toggleLike(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);

        if (!post) {
            throw new NotFoundException('Post no encontrado');
        }

        if (!post.likes) {
            post.likes = [];
        }

        const userIdStr = userId.toString();
        const isLiked = post.likes.some((id) => id && id.toString() === userIdStr);

        if (isLiked) {
            post.likes = post.likes.filter((id) => id && id.toString() !== userIdStr);
        } else {
            post.likes.push(new Types.ObjectId(userIdStr));
        }

        await post.save();
        return post.populate('author', 'fullName avatarUrl');
    }

    async addComment(userId: string, createCommentDto: any) {
        const { postId, content } = createCommentDto;

        // A) Crear el comentario
        const newComment = new this.commentModel({
            content,
            author: userId,
            post: postId,
        });
        await newComment.save();

        // B) Actualizar el contador en el Post padre (Optimización)
        await this.postModel.findByIdAndUpdate(postId, {
            $inc: { commentsCount: 1 } // Suma 1 al contador automáticamente
        });

        return newComment.populate('author', 'fullName avatarUrl');
    }

    async findCommentsByPost(postId: string) {
        return this.commentModel.find({ post: postId })
            .populate('author', 'fullName avatarUrl') // Para ver quién escribió
            .sort({ createdAt: 1 }) // Los más viejos primero (orden cronológico)
            .exec();
    }

    async findByAuthor(userId: string) {
        return this.postModel.find({ author: userId })
            .populate('author', 'fullName avatarUrl')
            .sort({ createdAt: -1 })
            .exec();
    }

    async deletePost(postId: string, userId: string) {
        const post = await this.postModel.findById(postId);

        if (!post) throw new NotFoundException('Post no encontrado');

        // Convertimos a string para comparar IDs de forma segura
        if (post.author.toString() !== userId.toString()) {
            throw new UnauthorizedException('No tienes permiso para borrar este post');
        }

        return this.postModel.findByIdAndDelete(postId);
    }
}
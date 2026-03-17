import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ForumController } from "./controller/forum.controller";
import { ForumService } from "./service/forum.service";
import { ForumPost, ForumPostSchema } from "./schema/forum-post.schema";
import { CloudinaryModule } from "src/common/cloudinary.module";
import { ForumComment, ForumCommentSchema } from "./schema/forum-comment.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ForumPost.name, schema: ForumPostSchema }]),
        MongooseModule.forFeature([{ name: ForumComment.name, schema: ForumCommentSchema }]),
        CloudinaryModule
    ],
    controllers: [ForumController],
    providers: [ForumService],
})
export class ForumModule { }
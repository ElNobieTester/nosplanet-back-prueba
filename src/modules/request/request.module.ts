import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Request, RequestSchema } from "./schema/requests.schema";
import { RequestsController } from "./controller/request.controller";
import { RequestsService } from "./service/request.service";

import { User, UserSchema } from "src/modules/users/schema/users.schema";
import { EcoParticipant, EcoParticipantSchema } from "src/modules/users/schema/eco-participant.schema";
import { Level, LevelSchema } from "src/modules/level/schema/levels.schema";

@Module({
        imports: [
                MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
                MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
                MongooseModule.forFeature([{ name: EcoParticipant.name, schema: EcoParticipantSchema }]),
                MongooseModule.forFeature([{ name: Level.name, schema: LevelSchema }])
        ],
        controllers: [RequestsController],
        providers: [RequestsService]
})
export class RequestModule { }
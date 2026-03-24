import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RedemptionSchema, Redemption } from "./schema/redemption.schema";
import { RedemptionsController } from "./controller/redemption.controller";
import { RedemptionsService } from "./service/redemption.service";
import { UsersModule } from "../users/users.module";
import { RewardsModule } from "../reward/reward.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Redemption.name, schema: RedemptionSchema }]),
        UsersModule, RewardsModule,
    ],
    controllers: [RedemptionsController],
    providers: [RedemptionsService],
    exports: [RedemptionsService],
})
export class RedemptionsModule { }
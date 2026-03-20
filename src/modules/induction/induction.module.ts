
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InductionController } from './controller/induction.controller';
import { InductionService } from './service/induction.service';
import { Induction, InductionSchema } from './schema/induction.schema';
import { User, UserSchema } from '../users/schema/users.schema';
import { EcoParticipant, EcoParticipantSchema } from '../users/schema/eco-participant.schema';
import { AccountManagerSchema, AccountManager } from '../users/schema/account-manager.schema';


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Induction.name, schema: InductionSchema }]),
        MongooseModule.forFeature([{ name: EcoParticipant.name, schema: EcoParticipantSchema }]),
        MongooseModule.forFeature([{ name: AccountManager.name, schema: AccountManagerSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [InductionController],
    providers: [InductionService],
})
export class InductionModule { }

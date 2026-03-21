import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './service/users.service';
import { UsersController } from './controller/users.controller';
import { User, UserSchema } from './schema/users.schema';
import { AccountManager, AccountManagerSchema } from './schema/account-manager.schema';
import { EcoParticipant, EcoParticipantSchema } from './schema/eco-participant.schema';
import { CloudinaryModule } from 'src/common/cloudinary.module';
import { Coordinator, CoordinatorSchema } from '../coordinators/schemas/coordinator.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: AccountManager.name, schema: AccountManagerSchema },
            { name: EcoParticipant.name, schema: EcoParticipantSchema },
            { name: Coordinator.name, schema: CoordinatorSchema }
        ]),
        CloudinaryModule
    ],

    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
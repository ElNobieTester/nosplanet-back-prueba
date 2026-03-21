import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoordinatorsController } from './controller/coordinators.controller';
import { CoordinatorsService } from './service/coordinators.service';
import { Coordinator, CoordinatorSchema } from './schemas/coordinator.schema';

import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Coordinator.name, schema: CoordinatorSchema }]),
        forwardRef(() => UsersModule)
    ],
    controllers: [CoordinatorsController],
    providers: [CoordinatorsService],
    exports: [CoordinatorsService],
})
export class CoordinatorsModule { }

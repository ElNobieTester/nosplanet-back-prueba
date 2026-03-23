import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coordinator, CoordinatorDocument } from '../schemas/coordinator.schema';
import { CreateCoordinatorDto, UpdateCoordinatorDto } from '../dto/coordinator.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CoordinatorsService {
    constructor(
        @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>
    ) { }

    async create(userId: string, managerId: string, programs: string[] = []): Promise<Coordinator> {
        const newCoordinator = new this.coordinatorModel({
            user: userId,
            managerId,
            programs
        });
        return newCoordinator.save();
    }

    async findAll(): Promise<Coordinator[]> {
        return this.coordinatorModel.find()
            .populate('user', 'fullName email phone avatarUrl isActive')
            .populate('managerId', 'fullName email')
            .populate('programs', 'title')
            .exec();
    }

    async findByManager(managerId: string): Promise<Coordinator[]> {
        return this.coordinatorModel.find({ managerId })
            .populate('user', 'fullName email phone avatarUrl isActive')
            .populate('programs', 'title createdAt')
            .exec();
    }

    async findOne(id: string): Promise<Coordinator> {
        const coordinator = await this.coordinatorModel.findById(id)
            .populate('user', 'fullName email phone avatarUrl isActive')
            .exec();
        if (!coordinator) throw new NotFoundException('Coordinator no encontrado');
        return coordinator;
    }

    async update(id: string, updateDto: UpdateCoordinatorDto): Promise<Coordinator> {
        const updated = await this.coordinatorModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
        if (!updated) throw new NotFoundException('Coordinator no encontrado');
        return updated;
    }

    async delete(id: string): Promise<any> {
        const deleted = await this.coordinatorModel.findByIdAndDelete(id).exec();
        if (!deleted) throw new NotFoundException('Coordinator no encontrado');
        return deleted;
    }
}

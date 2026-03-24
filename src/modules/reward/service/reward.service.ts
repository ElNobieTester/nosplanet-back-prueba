import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument } from '../schema/reward.schema';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { UpdateRewardDto } from '../dto/update-reward.dto';
import { RewardCategory } from '../enum/reward-category.enum';

@Injectable()
export class RewardsService {
    constructor(
        @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    ) { }

    async create(createRewardDto: CreateRewardDto): Promise<Reward> {
        const createdReward = new this.rewardModel(createRewardDto);
        return createdReward.save();
    }

    async findAll(category?: RewardCategory): Promise<Reward[]> {
        const filter = category && category !== ('all' as any)
            ? { category, isActive: true }
            : { isActive: true };

        return this.rewardModel.find(filter).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Reward> {
        const reward = await this.rewardModel.findById(id).exec();
        if (!reward) throw new NotFoundException(`Reward #${id} not found`);
        return reward;
    }

    async update(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
        const updatedReward = await this.rewardModel
            .findByIdAndUpdate(id, updateRewardDto, { new: true })
            .exec();
        if (!updatedReward) throw new NotFoundException(`Reward #${id} not found`);
        return updatedReward;
    }

    async remove(id: string): Promise<Reward> {
        const deletedReward = await this.rewardModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();
        if (!deletedReward) throw new NotFoundException(`Reward #${id} not found`);
        return deletedReward;
    }

    async updateStock(rewardId: string, quantity: number) {
        // quantity será -1 cuando alguien canjea un premio
        const updatedReward = await this.rewardModel.findByIdAndUpdate(
            rewardId,
            { $inc: { stock: quantity } },
            { new: true }
        ).exec();

        if (!updatedReward) {
            throw new NotFoundException(`Premio con ID ${rewardId} no encontrado`);
        }

        return updatedReward;
    }
}
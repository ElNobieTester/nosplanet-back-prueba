import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Redemption, RedemptionDocument } from "../schema/redemption.schema";
import { Model } from "mongoose";
import { UsersService } from "src/modules/users/service/users.service";
import { RewardsService } from "src/modules/reward/service/reward.service";
import { CreateRedemptionDto } from "../dto/create-redemption.dto";

@Injectable()
export class RedemptionsService {
    constructor(
        @InjectModel(Redemption.name) private redemptionModel: Model<RedemptionDocument>,
        private readonly usersService: UsersService,
        private readonly rewardsService: RewardsService,
    ) { }

    async create(userId: string, createDto: CreateRedemptionDto) {
        // Buscamos el premio y el usuario
        // Nota: Asegúrate de que findOne en RewardsService devuelva un objeto con puntos y stock
        const reward = await this.rewardsService.findOne(createDto.rewardId);
        const user = await this.usersService.findOne(userId);

        if (!reward) throw new NotFoundException('Premio no encontrado');
        if (!user) throw new NotFoundException('Usuario no encontrado');

        // 1. Validaciones
        if (reward.stock <= 0) throw new BadRequestException('Premio agotado');

        // Accedemos al perfil del usuario para validar puntos
        const userPoints = user.profile?.ecoPoints || 0;
        if (userPoints < reward.points) {
            throw new BadRequestException('Puntos insuficientes para este canje');
        }

        // 2. Generar Código Único (Corto y legible para humanos)
        const code = `ECO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // 3. Ejecutar Operaciones (Atómico)
        // Usamos (reward as any) para evitar el error de TypeScript con el _id
        await this.usersService.updatePoints(userId, -reward.points);
        await this.rewardsService.updateStock((reward as any)._id.toString(), -1);

        const newRedemption = new this.redemptionModel({
            userId: user._id,
            rewardId: (reward as any)._id,
            redemptionCode: code,
            status: 'PENDING'
        });

        return newRedemption.save();
    }

    async validateAndDeliver(code: string) {
        const redemption = await this.redemptionModel.findOne({
            redemptionCode: code,
            status: 'PENDING'
        }).populate('rewardId userId');

        if (!redemption) {
            throw new NotFoundException('El código es inválido, expiró o ya fue entregado');
        }

        redemption.status = 'DELIVERED';
        redemption.deliveredAt = new Date();

        return redemption.save();
    }
}
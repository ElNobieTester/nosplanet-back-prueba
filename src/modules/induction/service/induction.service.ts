import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Induction, InductionDocument } from '../schema/induction.schema';
import { CreateInductionDto } from '../dto/create-induction.dto';
import { UpdateInductionDto } from '../dto/update-induction.dto';
import { User, UserDocument } from 'src/modules/users/schema/users.schema';
import { EcoParticipant, EcoParticipantDocument } from 'src/modules/users/schema/eco-participant.schema';

@Injectable()
export class InductionService {
    constructor(
        @InjectModel(Induction.name) private inductionModel: Model<InductionDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(EcoParticipant.name) private participantModel: Model<EcoParticipantDocument>,
    ) { }

    async create(createInductionDto: CreateInductionDto): Promise<Induction> {
        const createdInduction = new this.inductionModel(createInductionDto);
        return createdInduction.save();
    }

    async findAll(): Promise<Induction[]> {
        return this.inductionModel.find({ isActive: true }).exec();
    }

    async findOne(id: string): Promise<Induction> {
        const induction = await this.inductionModel.findById(id).exec();
        if (!induction) {
            throw new NotFoundException(`Induction video with ID ${id} not found`);
        }
        return induction;
    }

    async update(id: string, updateInductionDto: UpdateInductionDto): Promise<Induction> {
        const updatedInduction = await this.inductionModel
            .findByIdAndUpdate(id, updateInductionDto, { new: true })
            .exec();
        if (!updatedInduction) {
            throw new NotFoundException(`Induction video with ID ${id} not found`);
        }
        return updatedInduction;
    }

    async remove(id: string): Promise<Induction> {
        const deletedInduction = await this.inductionModel
            .findByIdAndDelete(id)
            .exec();
        if (!deletedInduction) {
            throw new NotFoundException(`Induction video with ID ${id} not found`);
        }
        return deletedInduction;
    }

    async incrementView(id: string): Promise<Induction> {
        const updatedInduction = await this.inductionModel
            .findByIdAndUpdate(
                id,
                { $inc: { views: 1 } },
                { new: true },
            )
            .exec();
        if (!updatedInduction) {
            throw new NotFoundException(`Induction video with ID ${id} not found`);
        }
        return updatedInduction;
    }

    async viewAndClaimPoints(inductionId: string, userId: string) {
        // 1. Validar que la inducción existe
        const induction = await this.inductionModel.findById(inductionId).exec();
        if (!induction) {
            throw new NotFoundException(`Inducción no encontrada`);
        }

        // 2. Incrementar vistas de la inducción (Siempre sucede)
        induction.views += 1;
        await induction.save();

        // 3. Validar que el usuario existe
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`Usuario no encontrado`);
        }

        // 4. Verificar si ya reclamó puntos (Evitar duplicados)
        // Usamos includes porque completedInductions es un array de strings
        const alreadyClaimed = user.completedInductions.includes(inductionId);

        if (alreadyClaimed) {
            return {
                message: 'Vistas actualizadas. Los puntos ya habían sido reclamados anteriormente.',
                pointsEarned: 0
            };
        }

        // 5. Otorga puntos en EcoParticipant y registra en User
        // Agregamos el ID al historial del usuario
        user.completedInductions.push(inductionId);
        await user.save();

        // Buscamos su perfil de participante para sumarle los "current_points"
        const participantProfile = await this.participantModel.findOne({ user: new Types.ObjectId(userId) }).exec();

        if (participantProfile) {
            participantProfile.current_points += induction.ecoPoints;
            await participantProfile.save();
        }

        return {
            message: '¡Felicidades! Has ganado eco-puntos.',
            pointsEarned: induction.ecoPoints,
            totalPoints: participantProfile ? participantProfile.current_points : 0
        };
    }
}

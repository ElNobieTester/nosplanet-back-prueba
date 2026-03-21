// src/modules/users/service/users.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schema/users.schema';
import { AccountManager, AccountManagerDocument } from '../schema/account-manager.schema';
import { EcoParticipant, EcoParticipantDocument } from '../schema/eco-participant.schema';
import { Coordinator, CoordinatorDocument } from '../../coordinators/schemas/coordinator.schema';
import { CreateUserDto } from '../dto/users.dto';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { UserRole } from '../enum/userRole.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(AccountManager.name) private managerModel: Model<AccountManagerDocument>,
        @InjectModel(EcoParticipant.name) private participantModel: Model<EcoParticipantDocument>,
        @InjectModel(Coordinator.name) private coordinatorModel: Model<CoordinatorDocument>,
        private cloudinaryService: CloudinaryService
    ) { }

    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        // 1. Encriptar contraseña si existe
        if (createUserDto.password) {
            const salt = await bcrypt.genSalt(10);
            createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
        }

        // 2. Crear usuario base
        const createdUser = new this.userModel({
            ...createUserDto,
            needsPasswordChange: (createUserDto.role === UserRole.ADMIN || createUserDto.role === UserRole.MANAGER)
        });
        const savedUser = await createdUser.save();

        // 3. Crear Perfil según el Rol
        await this.createProfileForUser(savedUser, createUserDto);

        return savedUser;
    }

    private async createProfileForUser(user: UserDocument, dto: CreateUserDto) {
        const role = user.role as UserRole;

        // Si es Admin o Manager (Gestor)
        if (role === UserRole.ADMIN || role === UserRole.MANAGER) {
            await new this.managerModel({
                user: user._id,
                institution: dto.institution || (role === UserRole.ADMIN ? 'Nos Planet Central' : null)
            }).save();
        }

        // Si es Citizen, Recycler o Business (Participantes del juego)
        if (role === UserRole.CITIZEN || role === UserRole.RECYCLER || role === UserRole.BUSINESS) {
            await new this.participantModel({
                user: user._id
            }).save();
        }

        // Si es COORDINATOR
        if (role === UserRole.COORDINATOR) {
            await new this.coordinatorModel({
                user: user._id,
                managerId: (dto as any).managerId,
                programs: (dto as any).programs || []
            }).save();
        }
    }

    async findAll(): Promise<any[]> {
        // Retornamos los usuarios con sus perfiles unidos (Join dinámico)
        const users = await this.userModel.find().lean().exec();
        const fullUsers = await Promise.all(users.map(async (u) => {
            const profile = await this.getProfileForUser(u._id.toString(), u.role as UserRole);
            return { ...u, profile };
        }));
        return fullUsers;
    }

    async findOne(id: string): Promise<any | null> {
        const user = await this.userModel.findById(id).lean().exec();
        if (!user) return null;

        const profile = await this.getProfileForUser(id, user.role as UserRole);
        return { ...user, profile };
    }

    private async getProfileForUser(userId: string, role: UserRole) {
        const query = { user: userId }; // MongoDB es inteligente si le pasas el string en findOne a veces, pero vamos a ser explícitos

        if (role === UserRole.ADMIN || role === UserRole.MANAGER) {
            return this.managerModel.findOne({
                $or: [
                    { user: userId },
                    { user: new Types.ObjectId(userId) }
                ]
            }).exec();
        }
        if (role === UserRole.CITIZEN || role === UserRole.RECYCLER || role === UserRole.BUSINESS) {
            return this.participantModel.findOne({
                $or: [
                    { user: userId },
                    { user: new Types.ObjectId(userId) }
                ]
            }).exec();
        }
        if (role === UserRole.COORDINATOR) {
            return this.coordinatorModel.findOne({
                $or: [
                    { user: userId },
                    { user: new Types.ObjectId(userId) }
                ]
            }).exec();
        }
        return null;
    }

    async findOneByEmail(email: string): Promise<any | null> {
        const user = await this.userModel.findOne({ email }).lean().exec();
        if (!user) return null;

        const profile = await this.getProfileForUser(user._id.toString(), user.role as UserRole);
        return { ...user, profile };
    }

    async remove(id: string): Promise<UserDocument | null> {
        // También deberíamos borrar los perfiles (Soft delete o cascada)
        await this.managerModel.findOneAndDelete({ user: new Types.ObjectId(id) }).exec();
        await this.participantModel.findOneAndDelete({ user: new Types.ObjectId(id) }).exec();
        await this.coordinatorModel.findOneAndDelete({ user: new Types.ObjectId(id) }).exec();
        return this.userModel.findByIdAndDelete(id).exec();
    }

    async update(id: string, update: Partial<User>): Promise<UserDocument | null> {
        return this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
    }

    async updateAvatar(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ninguna imagen');
        }
        const result = await this.cloudinaryService.uploadFile(file);
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { avatarUrl: result.secure_url },
            { new: true }
        );
        if (!updatedUser) throw new NotFoundException('Usuario no encontrado');
        return { message: 'Avatar actualizado correctamente', avatarUrl: updatedUser.avatarUrl };
    }

    async updateProfile(userId: string, data: { fullName?: string; phone?: string }) {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, { ...data }, { new: true });
        if (!updatedUser) throw new NotFoundException('Usuario no encontrado');
        return updatedUser;
    }

    async changePassword(userId: string, newPassword: string) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            {
                password: hashedPassword,
                needsPasswordChange: false
            },
            { new: true }
        );

        if (!updatedUser) throw new NotFoundException('Usuario no encontrado');
        return { message: 'Contraseña actualizada correctamente' };
    }
}

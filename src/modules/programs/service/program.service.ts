import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Program } from "../schema/program.schema";
import { ProgramDocument } from "../schema/program.schema";
import { UpdateProgramDto } from "../dto/update-program.dto";
import { CreateProgramDto } from "../dto/create-program.dto";
import { ProgramType } from "../enum/progra-type.enum";
import { UsersService } from "../../users/service/users.service";


@Injectable()
export class ProgramsService {
    constructor(
        @InjectModel(Program.name) private programModel: Model<ProgramDocument>,
        private usersService: UsersService
    ) { }

    async findAll(user: any) {
        // Si es ADMIN o es un Ciudadano normal, que vea todos los programas activos
        if (!user || user.role === 'ADMIN' || user.role === 'CITIZEN' || user.role === 'RECYCLER') {
            return this.programModel.find({ isActive: true }).exec();
        }

        // Si es un MANAGER (Gestor), quizás solo quiere ver los suyos
        return this.programModel.find({
            managedBy: user.uid || user.sub || user._id,
            isActive: true
        }).exec();
    }

    async findAllProgramType(type?: ProgramType): Promise<Program[]> {
        const filter = type ? { organizationType: type, isActive: true } : { isActive: true };
        return this.programModel.find(filter).exec();
    }

    async joinProgram(programId: string, userId: string) {
        // 1. Verificamos que el programa exista
        const program = await this.programModel.findById(programId);
        if (!program) throw new NotFoundException('El programa no existe');

        // 2. Agregamos el ID del usuario al arreglo de participantes
        // Usamos $addToSet para que sea una operación atómica y única
        const updatedProgram = await this.programModel.findByIdAndUpdate(
            programId,
            { $addToSet: { participantsObj: userId } }, // 'participants' debe estar en tu Schema
            { new: true }
        ).exec();

        return {
            message: '¡Te has unido al programa con éxito! 🌿',
            program: updatedProgram
        };
    }

    async leaveProgram(programId: string, userId: string) {
        // Usamos $pull para remover el ID del arreglo
        const updatedProgram = await this.programModel.findByIdAndUpdate(
            programId,
            { $pull: { participantsObj: userId } },
            { new: true }
        ).exec();

        return {
            message: 'Has dejado el programa.',
            program: updatedProgram
        };
    }

    async create(createProgramDto: CreateProgramDto, user: any): Promise<Program> {
        // Obtenemos el perfil completo del usuario para sacar la institución
        const fullUser = await this.usersService.findOne(user.sub || user.uid || user._id);
        const institution = fullUser?.profile?.institution || null;

        const createdProgram = new this.programModel({
            ...createProgramDto,
            institution: institution,
            managedBy: user?.sub || user?.uid || user?._id || null
        });
        return createdProgram.save();
    }
    async update(id: string, updateProgramDto: UpdateProgramDto): Promise<Program> {
        const updatedProgram = await this.programModel
            .findByIdAndUpdate(id, updateProgramDto, { new: true }) // new: true devuelve el objeto ya actualizado
            .exec();

        if (!updatedProgram) {
            throw new NotFoundException(`Programa con ID ${id} no encontrado`);
        }
        return updatedProgram;
    }

    async remove(id: string): Promise<Program> {
        const deletedProgram = await this.programModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        if (!deletedProgram) {
            throw new NotFoundException(`Programa con ID ${id} no encontrado`);
        }
        return deletedProgram;
    }
    async findOne(id: string): Promise<Program> {
        const program = await this.programModel.findById(id).exec();
        if (!program) {
            throw new NotFoundException(`Programa con ID ${id} no encontrado`);
        }
        return program;
    }
}

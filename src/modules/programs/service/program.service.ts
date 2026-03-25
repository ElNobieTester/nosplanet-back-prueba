import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Program } from "../schema/program.schema";
import { ProgramDocument } from "../schema/program.schema";
import { UpdateProgramDto } from "../dto/update-program.dto";
import { CreateProgramDto } from "../dto/create-program.dto";
import { ProgramType } from "../enum/progra-type.enum";
import { UsersService } from "../../users/service/users.service";
import { FirebaseService } from "src/common/firebase.service";


@Injectable()
export class ProgramsService {
    constructor(
        @InjectModel(Program.name) private programModel: Model<ProgramDocument>,
        private usersService: UsersService,
        private firebaseService: FirebaseService
    ) { }


    async findAll(user: any) {
        const userId = user?.uid || user?.sub || user?._id;

        // Si es ADMIN, CITIZEN o RECYCLER, ve todos los programas activos
        if (!user || user.role === 'ADMIN' || user.role === 'CITIZEN' || user.role === 'RECYCLER') {
            return this.programModel.find({ isActive: true }).exec();
        }

        // Si es un MANAGER o Coordinador, ve los suyos (activos) que coincidan con su ID
        return this.programModel.find({
            isActive: true,
            $or: [
                { managedBy: userId },
                { coordinatorList: userId }
            ]
        }).exec();
    }
    async findAllPublic(): Promise<Program[]> {
        return this.programModel
            .find({
                $or: [
                    { isActive: true },
                    { isActive: { $exists: false } }
                ]
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findAllProgramType(type?: ProgramType): Promise<Program[]> {
        const filter = type ? { organizationType: type, isActive: true } : { isActive: true };
        return this.programModel.find(filter).exec();
    }

    async joinProgram(programId: string, user: any) {
        const userId = user.sub || user.uid || user._id;

        const program = await this.programModel.findById(programId);
        if (!program) throw new NotFoundException('Programa no encontrado');

        // ✅ CORRECCIÓN: Usa participantList (como está en tu Schema)
        if (program.participantList?.some(p => p.userId === userId)) {
            throw new BadRequestException('Ya estás participando en este programa');
        }

        const updatedProgram = await this.programModel.findByIdAndUpdate(
            programId,
            {
                $addToSet: { participantList: { userId, at: new Date() } }, // ✅ Con fecha
                $inc: { participants: 1 }
            },
            { new: true }
        ).exec();

        await this.usersService.update(userId, {
            $addToSet: { programsParticipating: programId }
        } as any);

        return { message: '¡Unido con éxito!', program: updatedProgram };
    }

    async leaveProgram(programId: string, userId: string) {
        // ✅ CORRECCIÓN: Usa participantList
        const updatedProgram = await this.programModel.findByIdAndUpdate(
            programId,
            {
                $pull: { participantList: { userId: userId } }, // ✅ Borra el objeto
                $inc: { participants: -1 }
            },
            { new: true }
        ).exec();

        return { message: 'Has dejado el programa.', program: updatedProgram };
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
        // 1. Buscar el programa actual
        const currentProgram = await this.programModel.findById(id).exec();
        if (!currentProgram) {
            throw new NotFoundException(`Programa con ID ${id} no encontrado`);
        }

        // 2. Si hay nueva imagen y ya había una vieja diferente, borrar la vieja
        if (updateProgramDto.imageUrl && currentProgram.imageUrl && updateProgramDto.imageUrl !== currentProgram.imageUrl) {
            await this.firebaseService.deleteFile(currentProgram.imageUrl);
        }

        // 3. Actualizar
        const updatedProgram = await this.programModel
            .findByIdAndUpdate(id, updateProgramDto, { new: true })
            .exec();

        if (!updatedProgram) throw new NotFoundException(`Error actualizando programa ${id}`);
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

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Redemption, RedemptionDocument } from "../schema/redemption.schema";
import { Model, Types } from "mongoose";
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
        console.log('DEBUG: Intentando buscar usuario con ID:', userId);

        // Forzamos la conversión a ObjectId para asegurar la búsqueda
        const user = await this.usersService.findOne(new Types.ObjectId(userId).toString());

        if (!user) {
            // Si entra aquí, imprimimos qué devolvió el servicio
            console.log('DEBUG: El servicio de usuarios devolvió NULL');
            throw new NotFoundException('Usuario no encontrado');
        }
        // Nota: Asegúrate de que findOne en RewardsService devuelva un objeto con puntos y stock
        const reward = await this.rewardsService.findOne(createDto.rewardId);
        console.log("datos de user", user)


        if (!reward) throw new NotFoundException('Premio no encontrado');
        if (!user) throw new NotFoundException('Usuario no encontrado');

        // 1. Validaciones
        if (reward.stock <= 0) throw new BadRequestException('Premio agotado');

        // Accedemos al perfil del usuario para validar puntos
        const userPoints = user.profile?.current_points || 0;
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
        // 1. Limpiamos el código que llega por parámetro
        const cleanCode = code.trim().toUpperCase();
        console.log(`DEBUG: Buscando código limpio: [${cleanCode}]`);

        const redemption = await this.redemptionModel.findOne({
            redemptionCode: cleanCode, // Usamos el código limpio
            status: 'PENDING'
        }).populate('rewardId userId');

        if (!redemption) {
            // Log extra para saber qué hay en la DB
            const existButClosed = await this.redemptionModel.findOne({ redemptionCode: cleanCode });
            if (existButClosed) {
                console.log(`DEBUG: El código existe pero su estado es: ${existButClosed.status}`);
            }
            throw new NotFoundException('El código es inválido, expiró o ya fue entregado');
        }

        redemption.status = 'DELIVERED';
        redemption.deliveredAt = new Date();

        return redemption.save();
    }

    async findMyRedemptions(userId: string) {
        // 1. Filtramos los canjes donde userId sea igual al id del usuario autenticado
        const redemptions = await this.redemptionModel.find({ userId })
            .populate('rewardId', 'title imageUrl sponsor points') // Traemos info del premio
            .sort({ createdAt: -1 }) // Los más recientes primero
            .lean()
            .exec();

        // 2. Mapeamos para devolver la data limpia
        return redemptions.map(redemption => ({
            ...redemption,
            // Si necesitas el perfil del usuario aquí podrías hacer el findOne, 
            // pero para el historial de la app móvil, con la info del premio suele bastar.
        }));
    }


    async findAll() {
        // 1. Obtenemos los canjes base (sin populate en userId para no duplicar trabajo)
        const redemptions = await this.redemptionModel.find()
            .populate('rewardId', 'title imageUrl sponsor points')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        // 2. Mapeamos y usamos tu servicio de usuarios para traer el perfil completo
        return Promise.all(redemptions.map(async (redemption) => {
            // Obtenemos el usuario con su profile (puntos, etc.) usando tu findOne
            const fullUser = await this.usersService.findOne(redemption.userId.toString());

            return {
                ...redemption,
                userId: fullUser // Ahora userId contiene .profile.current_points
            };
        }));
    }


    async findByCode(code: string) {
        const cleanCode = code.trim().toUpperCase();

        // 1. Buscamos el canje que esté PENDIENTE
        const redemption = await this.redemptionModel.findOne({
            redemptionCode: cleanCode,
            status: 'PENDING' // 👈 Importante: solo buscamos los que no se han entregado
        })
            .populate('rewardId') // Traemos info del premio (título, imagen)
            .lean()
            .exec();

        // 2. Si no existe, lanzamos error 404
        if (!redemption) {
            throw new NotFoundException('Código no encontrado, ya fue entregado o es inválido');
        }

        // 3. Usamos tu UsersService para traer al usuario con su PROFILE (puntos, etc.)
        const fullUser = await this.usersService.findOne(redemption.userId.toString());

        // 4. Retornamos el objeto "armado" para el Frontend
        return {
            ...redemption,
            userId: fullUser
        };
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Partner, PartnerDocument } from '../schema/partner.schema';
import { CreatePartnerDto } from '../dto/create-partner.dto';
import { UpdatePartnerDto } from '../dto/update-partner.dto';
import { FirebaseService } from 'src/common/firebase.service';

@Injectable()
export class PartnersService {
    constructor(
        @InjectModel(Partner.name) private partnerModel: Model<PartnerDocument>,
        private firebaseService: FirebaseService,
    ) { }


    async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
        const createdPartner = new this.partnerModel(createPartnerDto);
        return createdPartner.save();
    }

    async createFromRequest(requestData: any): Promise<Partner> {
        // Evitar duplicados si ya existe un socio con el mismo nombre
        const existing = await this.partnerModel.findOne({ name: requestData.name }).exec();
        if (existing) return existing;

        const newPartner = new this.partnerModel({
            name: requestData.name,
            filterType: 'all', // Default
            typeLabel: 'Empresa', // Default
            logo: 'https://via.placeholder.com/150', // Placeholder
            mainColor: '#018F64', // Default Green
            description: requestData.message || 'Descripción pendiente.',
            environmentalCommitment: 'Compromiso pendiente.',
            isLocked: true,
            isVisible: false,
        });
        return newPartner.save();
    }

    async findAll(): Promise<Partner[]> {
        // Sort pinned items first
        return this.partnerModel.find().sort({ isPinned: -1, _id: -1 }).exec();
    }

    async findOne(id: string): Promise<Partner> {
        const partner = await this.partnerModel.findById(id).exec();
        if (!partner) {
            throw new NotFoundException(`Partner with ID ${id} not found`);
        }
        return partner;
    }

    async update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner> {
        // 1. Buscar el socio actual
        const currentPartner = await this.partnerModel.findById(id).exec();
        if (!currentPartner) throw new NotFoundException(`Partner with ID ${id} not found`);

        // 2. Si se está enviando un nuevo logo y es diferente al anterior, borrar la previa
        if (updatePartnerDto.logo && currentPartner.logo && updatePartnerDto.logo !== currentPartner.logo) {
            await this.firebaseService.deleteFile(currentPartner.logo);
        }

        // 3. Ejecutar update
        const updatedPartner = await this.partnerModel
            .findByIdAndUpdate(id, updatePartnerDto, { new: true })
            .exec();

        if (!updatedPartner) throw new NotFoundException(`Error updating partner ${id}`);
        return updatedPartner;
    }

    async remove(id: string): Promise<Partner> {
        const partner = await this.partnerModel.findById(id).exec();
        if (!partner) throw new NotFoundException(`Partner with ID ${id} not found`);

        // 🗑️ Borramos el logo de Firebase si existe
        if (partner.logo) {
            await this.firebaseService.deleteFile(partner.logo);
        }

        const deletedPartner = await this.partnerModel.findByIdAndDelete(id).exec();
        if (!deletedPartner) throw new NotFoundException(`Error removing partner ${id}`);
        return deletedPartner;
    }

}

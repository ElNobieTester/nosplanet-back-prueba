import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CoordinatorsService } from '../service/coordinators.service';
import { CreateCoordinatorDto, UpdateCoordinatorDto } from '../dto/coordinator.dto';
import { UsersService } from '../../users/service/users.service';
import { UserRole } from '../../users/enum/userRole.enum';

@Controller('coordinators')
export class CoordinatorsController {
    constructor(
        private readonly coordinatorsService: CoordinatorsService,
        private readonly usersService: UsersService
    ) { }

    @Post()
    async create(@Body() createCoordinatorDto: any) {
        return this.usersService.create({
            ...createCoordinatorDto,
            role: UserRole.COORDINATOR
        });
    }

    @Get()
    findAll(@Query('managerId') managerId?: string) {
        if (managerId) {
            return this.coordinatorsService.findByManager(managerId);
        }
        return this.coordinatorsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.coordinatorsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCoordinatorDto: UpdateCoordinatorDto) {
        return this.coordinatorsService.update(id, updateCoordinatorDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.coordinatorsService.delete(id);
    }
}

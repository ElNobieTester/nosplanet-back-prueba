
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InductionService } from '../service/induction.service';
import { CreateInductionDto } from '../dto/create-induction.dto';
import { UpdateInductionDto } from '../dto/update-induction.dto';
import { Induction } from '../schema/induction.schema';

@ApiTags('Induction')
@Controller('induction')
export class InductionController {
    constructor(private readonly inductionService: InductionService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new induction video' })
    @ApiResponse({ status: 201, description: 'The video has been successfully created.', type: Induction })
    @ApiBody({ type: CreateInductionDto })
    create(@Body() createInductionDto: CreateInductionDto) {
        return this.inductionService.create(createInductionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all active induction videos' })
    @ApiResponse({ status: 200, description: 'List of all active videos.', type: [Induction] })
    findAll() {
        return this.inductionService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a video by ID' })
    @ApiResponse({ status: 200, description: 'The video found.', type: Induction })
    findOne(@Param('id') id: string) {
        return this.inductionService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a video' })
    @ApiResponse({ status: 200, description: 'The video has been successfully updated.', type: Induction })
    @ApiBody({ type: UpdateInductionDto })
    update(@Param('id') id: string, @Body() updateInductionDto: UpdateInductionDto) {
        return this.inductionService.update(id, updateInductionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a video' })
    @ApiResponse({ status: 200, description: 'The video has been successfully deleted.', type: Induction })
    remove(@Param('id') id: string) {
        return this.inductionService.remove(id);
    }


    @Patch(':id/view')
    @ApiOperation({ summary: 'Registrar vista de video y reclamar puntos' })
    async viewVideo(
        @Param('id') inductionId: string,
        @Body('userId') userId: string, // En una app real, esto vendría del JWT (User Decorator)
    ) {
        return this.inductionService.viewAndClaimPoints(inductionId, userId);
    }
}

import { Body, Controller, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RedemptionsService } from "../service/redemption.service";
import { CreateRedemptionDto } from "../dto/create-redemption.dto";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";



@Controller('redemptions')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class RedemptionsController {
    constructor(private readonly service: RedemptionsService) { }

    // Este lo usa el CIUDADANO desde la App
    @Post()
    @ApiOperation({ summary: 'Crear un canje' })
    redeem(@Req() req, @Body() createDto: CreateRedemptionDto) {
        return this.service.create(req.user.sub, createDto);
    }

    // Este lo usa el ADMIN desde la Web (Dashboard)
    @Patch('validate/:code')
    @ApiOperation({ summary: 'Validar canje' })
    validate(@Param('code') code: string) {
        return this.service.validateAndDeliver(code);
    }
}
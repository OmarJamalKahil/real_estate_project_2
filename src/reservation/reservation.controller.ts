import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateReservationParamDto } from './dto/create-reservation-param.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) { }

  @Post(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  create(
    @Req() req,
    @Param() createReservationParamDto:CreateReservationParamDto,
    @Body() createReservationDto: CreateReservationDto
  ) {
    const {userId} = req.user;
    return this.reservationService.create(userId,createReservationParamDto,createReservationDto);
  }

  
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
async cancelReservation(@Param('id') id: string, @Req() req) {
  const { userId } = req.user;
  return this.reservationService.remove(userId, id);
}

}

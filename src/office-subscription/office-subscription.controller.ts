import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { OfficeSubscriptionService } from './office-subscription.service';
import { CreateOfficeSubscriptionDto } from './dto/create-office-subscription.dto';
import { UpdateOfficeSubscriptionDto } from './dto/update-office-subscription.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('office-subscription')
export class OfficeSubscriptionController {
  constructor(private readonly officeSubscriptionService: OfficeSubscriptionService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  create(
    @Body() createOfficeSubscriptionDto: CreateOfficeSubscriptionDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.officeSubscriptionService.create(userId, createOfficeSubscriptionDto);
  }

  @Get()
  findAll() {
    return this.officeSubscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officeSubscriptionService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOfficeSubscriptionDto: UpdateOfficeSubscriptionDto) {
  //   return this.officeSubscriptionService.update(id, updateOfficeSubscriptionDto);
  // }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  remove(
    @Param('id') id: string,
    @Req() req,
  ) {
    const {userId} = req.user
    return this.officeSubscriptionService.remove(userId,id);
  }
}

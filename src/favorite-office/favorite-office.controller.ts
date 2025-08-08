import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FavoriteOfficeService } from './favorite-office.service';
import { CreateFavoriteOfficeDto } from './dto/create-favorite-office.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('favorite-office')
export class FavoriteOfficeController {
  constructor(private readonly favoriteOfficeService: FavoriteOfficeService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createFavoriteOfficeDto: CreateFavoriteOfficeDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoriteOfficeService.create(userId, createFavoriteOfficeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllFavoriteOfficeByUserId(
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoriteOfficeService.findAllFavoriteOfficeByUserId(userId);
  }

  // omar added this
  @Get(':officeId')
  @UseGuards(JwtAuthGuard)
  checkIfOfficeIsFavorite(
    @Param('officeId') officeId: string,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoriteOfficeService.checkIfOfficeIsFavorite(userId, officeId);
  }

  @Delete('allOffices')
  @UseGuards(JwtAuthGuard)
  remove(
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoriteOfficeService.removeAllByUserId(userId);
  }

  @Delete(':officeId')
  @UseGuards(JwtAuthGuard)
  removeByUserId(
    @Param('officeId') officeId: string,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoriteOfficeService.removeByUserId(userId, officeId);
  }

}

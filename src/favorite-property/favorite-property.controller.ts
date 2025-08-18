import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FavoritePropertyService } from './favorite-property.service';
import { CreateFavoritePropertyDto } from './dto/create-favorite-property.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('favorite-property')
export class FavoritePropertyController {
  constructor(private readonly favoritePropertyService: FavoritePropertyService) {}



  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createFavoritePropertyDto: CreateFavoritePropertyDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoritePropertyService.create(userId, createFavoritePropertyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllFavoriteOfficeByUserId(
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoritePropertyService.findAllFavoritePropertyByUserId(userId);
  }

    // omar added this
    @Get(':propertyId')
    @UseGuards(JwtAuthGuard)
    checkIfOfficeIsFavorite(
      @Param('propertyId') propertyId: string,
      @Req() req,
    ) {
      const { userId } = req.user;
      return this.favoritePropertyService.checkIfPropertyIsFavorite(userId, propertyId);
    }

  @Delete('allProperties')
  @UseGuards(JwtAuthGuard)
  remove(
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoritePropertyService.removeAllByUserId(userId);
  }

  @Delete(':propertyId')
  @UseGuards(JwtAuthGuard)
  removeByUserId(
    @Param('propertyId') propertyId: string,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.favoritePropertyService.removeByUserId(userId, propertyId);
  }



}

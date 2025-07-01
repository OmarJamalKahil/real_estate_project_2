import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Put, UseGuards, Req } from '@nestjs/common';
import { OfficeService } from './office.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { UpdateOfficeStatusDto } from './dto/update-office-status.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/entities/user.entity';
import { OfficeRatingService } from './office_rating.service';
import { CreateOrUpdateOfficeRatingDto } from './dto/create-or-update-office-rating.dto';

@Controller('office')
export class OfficeController {
  constructor(
    private readonly officeService: OfficeService,
    private readonly officeRatingService: OfficeRatingService,

  ) { }

  @Post('/create-office')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  @UseInterceptors(FileInterceptor('license_photo'))
  @UseInterceptors(FileInterceptor('office_photo'))
  uploadFile(
    @Body() createOfficeDto: CreateOfficeDto,
    @UploadedFile(FileValidationPipe) license_photo: Express.Multer.File,
    @UploadedFile(FileValidationPipe) office_photo: Express.Multer.File,
    @Req() req
  ) {
    const { userId } = req.user;
    return this.officeService.create(createOfficeDto, license_photo,office_photo, userId)
  }

  @Get()
  findAll() {
    return this.officeService.getAllOfficesWithAverageRating();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officeService.findOne(id);
  }

  @Put('/status/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN,Role.SUPERADMIN)
  updateStatus(@Param('id') id: string, @Body() updateOfficeStatusDto: UpdateOfficeStatusDto) {
    return this.officeService.updatingStatus(id, updateOfficeStatusDto);
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  update(
    @Param('id') id: string,
    @Body() updateOfficeDto: UpdateOfficeDto,
    @Req() req,
  ) {
    const {userId} = req.user
    return this.officeService.update(id, updateOfficeDto,userId);
  }


  @Post(':officeId/rate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async rateOffice(
    @Param('officeId') officeId: string,
    @Body() body: CreateOrUpdateOfficeRatingDto,
    @Req() req,
  ) {
    const {userId} = req.user;
    return this.officeRatingService.rateOffice(officeId,userId, body.rating);
  }

  @Get('ratings/averages')
  async getAverages() {
    return this.officeRatingService.getOfficeAverageRatings();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.officeService.remove(id);
  }
}

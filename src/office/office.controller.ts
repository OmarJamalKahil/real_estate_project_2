import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Put, UseGuards, Req, UploadedFiles, Query } from '@nestjs/common';
import { OfficeService } from './office.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { UpdateOfficeStatusDto } from './dto/update-office-status.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/entities/user.entity';
import { OfficeRatingService } from './office_rating.service';
import { CreateOrUpdateOfficeRatingDto } from './dto/create-or-update-office-rating.dto';
import { MultiFileValidationPipe } from 'src/common/pipes/multi-files-validation.pipe';
import { PaginationDto } from 'src/common/utils/pagination.dto';

@Controller('office')
export class OfficeController {
  constructor(
    private readonly officeService: OfficeService,
    private readonly officeRatingService: OfficeRatingService,

  ) { }

  @Get('user-office')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  getUserOffice(
    @Req() req,
  ) {
    const { userId } = req.user;
    
    return this.officeService.getCurrentUserOffice(userId,true);
  }

  @Post('/create-office')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.OFFICEMANAGER)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'license_photo', maxCount: 1 },
    { name: 'office_photo', maxCount: 1 },
  ]))
  async uploadFile(
    @Body() createOfficeDto: CreateOfficeDto,
    @UploadedFiles(MultiFileValidationPipe) files: {
      license_photo?: Express.Multer.File[],
      office_photo?: Express.Multer.File[]
    },
    @Req() req
  ) {
    const { userId } = req.user;

    return this.officeService.create(
      createOfficeDto,
      userId,
      files.license_photo![0],
      files.office_photo![0],
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() paginationDto:PaginationDto,
    @Req() req,
  ) {
    const {userId} = req.user;
    return this.officeService.getAllOfficesWithAverageRating(userId,paginationDto);
  }


  @Get('get-all-offices-which-are-still-not-accepted')
  getAllOfficesWhichAreStillNotAccepted(
    @Query() paginationDto:PaginationDto

  ) {
    return this.officeService.getAllOfficesWhoAreStillNotAccepted(paginationDto);
  }




  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officeService.findOne(id);
  }


  @Put('/status/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  updateStatus(@Param('id') id: string, @Body() updateOfficeStatusDto: UpdateOfficeStatusDto) {
    return this.officeService.updatingStatus(id, updateOfficeStatusDto);
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  @UseInterceptors(FileInterceptor('office_photo'))
  update(
    @Param('id') id: string,
    @Body() updateOfficeDto: UpdateOfficeDto,
    @Req() req,
    @UploadedFile() office_photo?: Express.Multer.File,
  ) {
    const { userId } = req.user
    return this.officeService.update(id, updateOfficeDto, userId, office_photo);
  }


  @Post(':officeId/rate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async rateOffice(
    @Param('officeId') officeId: string,
    @Body() body: CreateOrUpdateOfficeRatingDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.officeRatingService.rateOffice(officeId, userId, body.rating);
  }
 

 
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(
    @Param('id') id: string,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.officeService.remove(id, userId);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, UsePipes, ParseArrayPipe, UseGuards, Put, Req, Query, UploadedFile } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MultiFileValidationPipe } from 'src/common/pipes/multi-files-validation.pipe';
import { CreatePropertyValidationPipe } from 'src/common/pipes/create-property-validation.pipe';
import { validateDto } from 'src/common/functions/validate-dto.function';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto';
import { PaginationDto } from '../common/utils/pagination.dto';
import { CreateAttributeDto } from './dto/attribute/create-attribute.dto';
import { SearchPaymentCardDto } from 'src/payment-card/dto/create-payment-card.dto';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }


  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'property_photos', maxCount: 15 },
  ]))
  async createProperty(
    @UploadedFiles(MultiFileValidationPipe) files: {
      property_photos: Express.Multer.File[],
    },
    @Body() createPropertyDtoRaw: CreatePropertyDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.propertyService.create(userId, createPropertyDtoRaw, files.property_photos)
  }


  @Post("/add-new-photo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  @UseInterceptors(FileInterceptor('photo'))
  async addNewPhotoToPropertyPhotos(
    @UploadedFile() photo: Express.Multer.File,
    @Body() body,
    @Req() req,
  ) {
    return this.propertyService.addNewPhotoToPropertyPhotos(body.propertyId, photo)
  }


  @Delete("/remove-property-photo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  async removePhotoOfPropertyFromPropertyPhotos(
    @Body() body,
    @Req() req,
  ) {
    return this.propertyService.removePhotoOfPropertyFromPropertyPhotos(body?.propertyPhotoId);
  }


  @Post("/add-new-attribute")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  async addNewAttributeToPropertyAttributes(
    @Body() createAttributeDto: CreateAttributeDto,
  ) {
    return this.propertyService.addNewAttributeToPropertyAttributes(createAttributeDto)
  }


  @Delete("/remove-property-attribute")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  async removeAttributeOfPropertyFromPropertyAttributes(
    @Body() body,
    @Req() req,
  ) {

    return this.propertyService.removeAttributeOfPropertyFromPropertyAttributes(body?.propertyAttributeId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  async updateProperty(
    @Param("id") id: string,
    @Body() updatePropertyDtoRaw: UpdatePropertyDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.propertyService.update(id, userId, updatePropertyDtoRaw)
  }


  @Get()
  getAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.propertyService.findAllAcceptedProperties(paginationDto)
  }


  @Get('get-all-properties-which-are-still-not-accepted')
  getAllPropertiesAreStillNotAcceptedYet(
    @Query() paginationDto: PaginationDto
  ) {
    return this.propertyService.getAllPropertiesWhoAreStillNotAccepted(paginationDto)
  }

  @Post('/filter')
  @UseGuards(JwtAuthGuard)
  getPropertiesByFiltering(
    @Body() filterPropertyDto: FilterPropertyDto,
    @Query() paginationDto: PaginationDto,
    @Req() req,

  ) {
    const { userId } = req.user
    return this.propertyService.findPropertiesByFiltering(filterPropertyDto, paginationDto, userId)
  }

  @Get('/reserved')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.OFFICEMANAGER)
  getReservedProperties(
    @Query() paginationDto: PaginationDto,
    @Req() req,
  ) {
    const { userId } = req.user
    return this.propertyService.findAllReservedPropertiesForUser(userId, paginationDto)
  }


  @Get('office/:officeId')
  getPropertiesByOfficeId(
    @Param('officeId') officeId: string,
    @Query() paginationDto: PaginationDto

  ) {
    return this.propertyService.findByOfficeId(officeId, paginationDto)
  }


  @Get(':id')
  getById(
    @Param('id') id: string
  ) {

    return this.propertyService.findOne(id)
  }

  @Put('/status/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  updateStatus(@Param('id') id: string, @Body() updatePropertyStatusDto: UpdatePropertyStatusDto) {
    return this.propertyService.updatePropertyStatus(id, updatePropertyStatusDto);
  }



  @Post('/pay-before/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  PayBeforeDeletePropertyById(
    @Param('id') id: string,
    @Body() searchPaymentCardDto: SearchPaymentCardDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.propertyService.payBeforeRemove(id, searchPaymentCardDto,userId)
  }






  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  DeletePropertyById(
    @Param('id') id: string
  ) {
    return this.propertyService.remove(id)
  }

}

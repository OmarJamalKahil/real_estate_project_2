import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, UsePipes, ParseArrayPipe, Req, UseGuards, Put } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto, CreateAttributeDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MultiFileValidationPipe } from 'src/common/pipes/multi-files-validation.pipe';
import { CreatePropertyValidationPipe } from 'src/common/pipes/create-property-validation.pipe';
import { validateDto } from 'src/common/functions/validate-dto.function';
import { plainToInstance } from 'class-transformer';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

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

  @Get()
  getAll(
  ) {
    return this.propertyService.findAll()
  }

  @Get(':id')
  getById(
    @Param('id') id: string
  ) {
    return this.propertyService.findOne(id)
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  // @UseInterceptors(FileFieldsInterceptor([
  //   { name: 'property_photos', maxCount: 15 },
  // ]))
  async updateProperty(
    // @UploadedFiles(MultiFileValidationPipe) files: {
    //   property_photos: Express.Multer.File[],
    // },
    @Param("id") id: string,
    @Body() updatePropertyDtoRaw: UpdatePropertyDto,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.propertyService.update(id, userId, updatePropertyDtoRaw)
  }


  @Delete(':id')
  DeletePropertyById(
    @Param('id') id: string
  ) {
    return this.propertyService.remove(id)
  }

}

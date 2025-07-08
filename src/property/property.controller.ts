import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, UsePipes, ParseArrayPipe, Req, UseGuards } from '@nestjs/common';
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

  // @Post()
  // @UsePipes(CreatePropertyValidationPipe)  // Apply the validation pipe here
  // @UseInterceptors(FileFieldsInterceptor([
  //   { name: 'property_photos', maxCount: 15 },
  // ]))
  // create(
  //   @Body('createPropertyDto') createPropertyDtoRaw: string,  // Receive JSON string as text
  //   @UploadedFiles(MultiFileValidationPipe) files: {
  //     property_photos: Express.Multer.File[],
  //   },) {

  //   try {
  //     // Parse the JSON received in the 'createPropertyDto' field
  //     const createPropertyDto: CreatePropertyDto = JSON.parse(createPropertyDtoRaw);




  //     // Manually validate the DTO (class-validator won't run automatically on parsed JSON)
  //     // If you want to use automatic validation, you can use a pipe to validate after parsing.
  //     // For example, you can create a validation pipe that validates the parsed object before using it.

  //     console.log(createPropertyDto);  // Show parsed data for debugging
  //     console.log(files?.property_photos?.length);  // Number of uploaded photos
  //     return this.propertyService.create(createPropertyDto, files.property_photos)
  //     // Further processing (e.g., saving property and files to the database)
  //     return { success: true, message: 'Property created successfully' };
  //   } catch (error) {
  //     throw new BadRequestException('Invalid data format or parsing error.');
  //   }
  // }


  // @Post()
  // @UseInterceptors(FileFieldsInterceptor([
  //   { name: 'property_photos', maxCount: 15 },
  // ])) async createProperty(
  //   @UploadedFiles(MultiFileValidationPipe) files: {
  //     property_photos: Express.Multer.File[],
  //   }
  //   , @Body() createPropertyDtoRaw: CreatePropertyDto,) {

  //   // form-data body is a plain object, you validate it like this:

  //   console.log(createPropertyDtoRaw);
  //   console.log(files);

  //   // proceed with your logic
  //   return { success: true };
  // }


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
  // // manually parse nested fields:
  // createPropertyDtoRaw.location = JSON.parse(createPropertyDtoRaw.location);
  // createPropertyDtoRaw.attributes = JSON.parse(createPropertyDtoRaw.attributes);

  // // validate 
  // const createPropertyDto = plainToInstance(CreatePropertyDto, createPropertyDtoRaw);

  // if using pipes globally, this will work


  @Get()
  getAll(

  ) {
    return this.propertyService.findAll()
  }

}

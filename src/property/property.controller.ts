import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, BadRequestException, UsePipes } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MultiFileValidationPipe } from 'src/common/pipes/multi-files-validation.pipe';
import { CreatePropertyValidationPipe } from 'src/common/pipes/create-property-validation.pipe';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Post()
  @UsePipes(CreatePropertyValidationPipe)  // Apply the validation pipe here
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'property_photos', maxCount: 15 },
  ]))
  create(
    @Body('createPropertyDto') createPropertyDtoRaw: string,  // Receive JSON string as text
    @UploadedFiles(MultiFileValidationPipe) files: {
      property_photos: Express.Multer.File[],
    },) {

    try {
      // Parse the JSON received in the 'createPropertyDto' field
      const createPropertyDto: CreatePropertyDto = JSON.parse(createPropertyDtoRaw);

      // Manually validate the DTO (class-validator won't run automatically on parsed JSON)
      // If you want to use automatic validation, you can use a pipe to validate after parsing.
      // For example, you can create a validation pipe that validates the parsed object before using it.

      console.log(createPropertyDto);  // Show parsed data for debugging
      console.log(files?.property_photos?.length);  // Number of uploaded photos
      return this.propertyService.create(createPropertyDto, files.property_photos)
      // Further processing (e.g., saving property and files to the database)
      return { success: true, message: 'Property created successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid data format or parsing error.');
    }
  }

  @Get()
  getAll(

  ) {
    return this.propertyService.findAll()
  }

}

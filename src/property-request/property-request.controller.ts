// import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
// import { PropertyRequestService } from './property-request.service';
// import { CreatePropertyRequestDto } from './dto/create-property-request.dto';
// import { UpdatePropertyRequestDto } from './dto/update-property-request.dto';
// import { FileFieldsInterceptor } from '@nestjs/platform-express';
// import { MultiFileValidationPipe } from 'src/common/pipes/multi-files-validation.pipe';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { Roles } from 'src/common/decorators/roles.decorator';
// import { Role } from 'src/user/entities/user.entity';
// import {  CreateRentalExpirationDateDto } from './dto/create-rental-expiration-date.dto';

// @Controller('property-request')
// export class PropertyRequestController {
//   constructor(private readonly propertyRequestService: PropertyRequestService) { }

//   @Post()
//   @UseInterceptors(FileFieldsInterceptor([
//     { name: 'property_request_photos', maxCount: 15 },
//   ]))
//   create(
//     @UploadedFiles(MultiFileValidationPipe) files: {
//       property_request_photos: Express.Multer.File[],
//     },
//     @Body() createPropertyRequestDto: CreatePropertyRequestDto
//   ) {
//     return this.propertyRequestService.create(createPropertyRequestDto, files.property_request_photos);
//   }

//   @Get()
//   findAll() {
//     return this.propertyRequestService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.propertyRequestService.findOne(id);
//   }



// }


import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { PropertyRequestService } from './property-request.service';
import { CreatePropertyRequestDto } from './dto/create-property-request.dto';
import { UpdatePropertyRequestDto } from './dto/update-property-request.dto';
import { UpdatePropertyRequestByAdminDto } from './dto/update-property-request-by-admin.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MultiFileValidationPipe } from 'src/common/pipes/multi-files-validation.pipe';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/entities/user.entity';

@Controller('property-request')
@UseGuards(JwtAuthGuard) // Global guard for all routes in this controller
export class PropertyRequestController {
  constructor(private readonly propertyRequestService: PropertyRequestService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'property_request_photos', maxCount: 15 }]),
  )
  create(
    @UploadedFiles(MultiFileValidationPipe)
    files: { property_request_photos?: Express.Multer.File[] },
    @Body() createDto: CreatePropertyRequestDto,
  ) {
    return this.propertyRequestService.create(
      createDto,
      files.property_request_photos || [],
    );
  }

  @Get()
  findAll() {
    return this.propertyRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyRequestService.findOne(id);
  }

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyRequestService.remove(id);
  }
  
  // Admin-only endpoint
  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  updateByAdmin(
    @Param('id') id: string,
    @Body() updateByAdminDto: UpdatePropertyRequestByAdminDto,
  ) {

    
    return this.propertyRequestService.updatePropertyRequestByAdmin(
      id,
      updateByAdminDto,
    );
  }
}

// @Patch(':id')
// @UseInterceptors(
//   FileFieldsInterceptor([{ name: 'property_request_photos', maxCount: 15 }]),
// )
// update(
//   @Param('id') id: string,
//   @UploadedFiles(MultiFileValidationPipe)
//   files: { property_request_photos?: Express.Multer.File[] },
//   @Body() updateDto: UpdatePropertyRequestDto,
// ) {
//   return this.propertyRequestService.update(
//     id,
//     updateDto,
//     files.property_request_photos || [],
//   );
// }
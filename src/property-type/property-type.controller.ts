import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { PropertyTypeService } from './property-type.service';
import { UpdatePropertyTypeDto } from './dto/update-property-type.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreatePropertyTypeDto } from './dto/create-property-type.dto copy';
import { Role } from 'src/user/entities/user.entity';

@Controller('property-type')
export class PropertyTypeController {
  constructor(private readonly propertyTypeService: PropertyTypeService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(@Body() createPropertyTypeDto: CreatePropertyTypeDto) {
    return this.propertyTypeService.create(createPropertyTypeDto);
  }

  @Get()
  findAll() {
    return this.propertyTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyTypeService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() updatePropertyTypeDto: UpdatePropertyTypeDto) {
    return this.propertyTypeService.update(id, updatePropertyTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.propertyTypeService.remove(id);
  }
}

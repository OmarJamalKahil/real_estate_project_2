import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Put,
} from '@nestjs/common';
import { LicenseTypeService } from './license-type.service';
import { CreateLicenseTypeDto } from './dto/create-license-type.dto';
import { UpdateLicenseTypeDto } from './dto/update-license-type.dto';
import { Role } from 'src/user/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('license-types')
export class LicenseTypeController {
  constructor(private readonly licenseTypeService: LicenseTypeService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(@Body() createDto: CreateLicenseTypeDto) {
    return this.licenseTypeService.create(createDto);
  }

  @Get()
  findAll() {
    return this.licenseTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.licenseTypeService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLicenseTypeDto,
  ) {
    return this.licenseTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.licenseTypeService.remove(id);
  }
}

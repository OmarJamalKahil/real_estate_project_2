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

@Controller('office')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) { }

  @Post('/create-office')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Body() createOfficeDto: CreateOfficeDto,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Req() req
  ) {
    const { userId } = req.user;
    return this.officeService.create(createOfficeDto, file, userId)
  }

  @Get()
  findAll() {
    return this.officeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.officeService.findOne(id);
  }

  @Put('/status/:id')
  updateStatus(@Param('id') id: string, @Body() updateOfficeStatusDto: UpdateOfficeStatusDto) {
    return this.officeService.updatingStatus(id, updateOfficeStatusDto);
  }


  @Put(':id')
  update(@Param('id') id: string, @Body() updateOfficeDto: UpdateOfficeDto) {
    return this.officeService.update(id, updateOfficeDto);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.officeService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { OfficeService } from './office.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { UpdateOfficeStatusDto } from './dto/update-office-status.dto';

@Controller('office')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    createOfficeDto: CreateOfficeDto,
    @UploadedFile(FileValidationPipe) file: Express.Multer.File) {
    return this.officeService.create(createOfficeDto, file)
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

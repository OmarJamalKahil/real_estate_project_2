import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OfficeComplaintService } from './office-complaint.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/user/entities/user.entity';
import { CreateOfficeComplaintDto } from './dto/create-office-complaint.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MultiFileValidationPipe } from 'src/common/pipes/multi-files-validation.pipe';

@Controller('office-complaint')
export class OfficeComplaintController {
  constructor(
    private readonly officeComplaintService: OfficeComplaintService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'complaint_media', maxCount: 15 }]),
  )
  async createComplaint(
    @UploadedFiles(MultiFileValidationPipe)
    files: {
      complaint_media: Express.Multer.File[];
    },
    @Req() req,
    @Body() createOfficeComplaintDto: CreateOfficeComplaintDto,
  ) {
    const { userId } = req.user;
    return this.officeComplaintService.createComplaint(
      userId,
      createOfficeComplaintDto,
      files.complaint_media,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  async getAllOfficeComplaints(@Req() req) {
    const { userId } = req.user;

    return this.officeComplaintService.getAllOfficeComplaints(userId);
  }

  @Get('/user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  async getAllComplaintsForUser(@Req() req) {
    const { userId } = req.user;

    return this.officeComplaintService.getAllOfficeComplaintsForUser(userId);
  }

  @Delete(":complaintId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN)
  async deleteOfficeComplaint(@Param("complaintId") complaintId: string, @Req() req) {
            const { userId } = req.user;

    return this.officeComplaintService.deleteOfficeComplaint(userId, complaintId);
  }
}

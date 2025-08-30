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
import { PropertyComplaintService } from './property-complaint.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/user/entities/user.entity';
import { CreatePropertyComplaintDto } from './dto/create-property-complaint.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MultiFileValidationPipe } from 'src/common/pipes/multi-files-validation.pipe';

@Controller('property-complaint')
export class PropertyComplaintController {
  constructor(
    private readonly propertyComplaintService: PropertyComplaintService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.OFFICEMANAGER)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'complaint_media', maxCount: 15 }]),
  )
  async createComplaint(
    @UploadedFiles(MultiFileValidationPipe)
    files: {
      complaint_media: Express.Multer.File[];
    },
    @Req() req,
    @Body() createPropertyComplaintDto: CreatePropertyComplaintDto,
  ) {
    const { userId } = req.user;
    return this.propertyComplaintService.createComplaint(
      userId,
      createPropertyComplaintDto,
      files.complaint_media,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getAllPropertyComplaints(@Req() req) {
    const { userId } = req.user;
    return this.propertyComplaintService.getAllPropertyComplaints();
  }



  @Get('/office')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  async getAllPropertyComplaintsForOffice(@Req() req) {
    const { userId } = req.user;
    return this.propertyComplaintService.getAllPropertyComplaintsForOffice(userId);
  }


  @Get('/user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER,Role.OFFICEMANAGER)
  async getAllPropertyComplaintsForUser(@Req() req) {
    const { userId } = req.user;

    return this.propertyComplaintService.getAllPropertyComplaintsForUser(userId);
  }

  @Delete(":complaintId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN, Role.OFFICEMANAGER)
  async deletePropertyComplaint(@Param("complaintId") complaintId: string, @Req() req) {
    const { userId } = req.user;
    return this.propertyComplaintService.deletePropertyComplaint(userId, complaintId);
  }
}

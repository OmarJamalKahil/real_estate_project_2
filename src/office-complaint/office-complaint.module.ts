import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeComplaintController } from './office-complaint.controller';
import { OfficeComplaintService } from './office-complaint.service';
import { OfficeComplaint } from './entities/office-complaint.entity';
import { Office } from 'src/office/entities/office.entity';
import { User } from 'src/user/entities/user.entity';
import { OfficeComplaintPhoto } from './entities/office-complaint-photo.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficeComplaint,
      Office,
      User,
      OfficeComplaintPhoto,
    ]),
    CloudinaryModule,
  ],
  controllers: [OfficeComplaintController],
  providers: [OfficeComplaintService],
  exports: [OfficeComplaintService],
})
export class OfficeComplaintModule {}

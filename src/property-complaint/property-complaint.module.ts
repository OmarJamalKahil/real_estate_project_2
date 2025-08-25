import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Property } from 'src/property/entities/property.entity';
import { PropertyComplaint } from './entities/property-complaint.entity';
import { PropertyComplaintPhoto } from './entities/property-complaint-photo.entity';
import { PropertyComplaintController } from './property-complaint.controller';
import { PropertyComplaintService } from './property-complaint.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyComplaint,
      Property,
      User,
      PropertyComplaintPhoto,
    ]),
    CloudinaryModule,
  ],
  controllers: [PropertyComplaintController],
  providers: [PropertyComplaintService],
  exports: [PropertyComplaintService],
})
export class PropertyComplaintModule {}

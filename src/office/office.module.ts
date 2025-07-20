import { Module } from '@nestjs/common';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { Office } from './entities/office.entity';
import { LicensePhoto } from './entities/license_photo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { OfficeRating } from './entities/office_rating.entity';
import { OfficeRatingService } from './office_rating.service';
import { OfficePhoto } from './entities/office_photo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Office, LicensePhoto,User,OfficeRating,OfficePhoto]),
    CloudinaryModule,
  ], // <-- FIX HERE
  controllers: [OfficeController],
  providers: [OfficeService,OfficeRatingService],
  exports: [OfficeService,OfficeRatingService],
})
export class OfficeModule { }

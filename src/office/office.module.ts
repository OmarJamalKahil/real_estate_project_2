import { Module } from '@nestjs/common';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { Office } from './entities/office.entity';
import { OfficeSubscription } from './entities/office_subscription.entity';
import { LicensePhoto } from './entities/license_photo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Office, OfficeSubscription, LicensePhoto]),
    CloudinaryModule,
  ], // <-- FIX HERE
  controllers: [OfficeController],
  providers: [OfficeService],
})
export class OfficeModule { }

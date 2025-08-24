import { forwardRef, Module } from '@nestjs/common';
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
import { OfficeSubscription } from 'src/office-subscription/entities/office-subscription.entity';
import { OfficeSubscriptionModule } from 'src/office-subscription/office-subscription.module';
import { NotificationModule } from 'src/notification/notification.module';
import { Notification } from 'src/notification/entities/notification.entity';
import { Photo } from 'src/common/entities/Photo.entity';
import { Property } from 'src/property/entities/property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Office, LicensePhoto, User, OfficeRating, Photo, OfficeSubscription, Notification, 
      Property
    ]),
    CloudinaryModule,
    NotificationModule,
    forwardRef(() => OfficeSubscriptionModule),
  ], // <-- FIX HERE
  controllers: [OfficeController],
  providers: [OfficeService, OfficeRatingService],
  exports: [OfficeService, OfficeRatingService],
})
export class OfficeModule { }

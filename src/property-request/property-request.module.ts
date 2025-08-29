import { Module } from '@nestjs/common';
import { PropertyRequestService } from './property-request.service';
import { PropertyRequestController } from './property-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyRequest } from './entities/property-request.entity';
import { PropertyRequestPhoto } from './entities/property-request-photo.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Property } from 'src/property/entities/property.entity';
import { PropertyModule } from 'src/property/property.module';
import { NotificationModule } from 'src/notification/notification.module';
import { StatisticsModule } from 'src/statistics/statistics.module';
import { ArchiveModule } from 'src/archive/archive.module';
import { Record } from 'src/archive/entities/record.entity';
import { Archive } from 'src/archive/entities/archive.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { RentalExpirationDate } from './entities/rental-expiration-date.entity';
import { UserProperty } from 'src/user/entities/user-property.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyRequest,
      PropertyRequestPhoto,
      RentalExpirationDate,
      Property,
      Record,
      Archive,
      UserProperty,
      Reservation,
    ]),
    CloudinaryModule,
    PropertyModule,
    NotificationModule,
    StatisticsModule,
    ArchiveModule,
  ],
  controllers: [PropertyRequestController],
  providers: [PropertyRequestService],
})
export class PropertyRequestModule {}

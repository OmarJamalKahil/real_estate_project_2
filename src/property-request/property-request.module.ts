import { Module } from '@nestjs/common';
import { PropertyRequestService } from './property-request.service';
import { PropertyRequestController } from './property-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyRequest } from './entities/property-request.entity';
import { PropertyRequestPhoto } from './entities/property-request-photo.entity';
import { RentalExpirationDate } from './entities/rental-expiration-date.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Property } from 'src/property/entities/property.entity';
import { PropertyModule } from 'src/property/property.module';
import { NotificationModule } from 'src/notification/notification.module';
import { StatisticsModule } from 'src/statistics/statistics.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      PropertyRequest,PropertyRequestPhoto,RentalExpirationDate,Property
    ]),
    CloudinaryModule,
    PropertyModule,
    NotificationModule,
    StatisticsModule,
  ],
  controllers: [PropertyRequestController],
  providers: [PropertyRequestService],
}) 
export class PropertyRequestModule {}

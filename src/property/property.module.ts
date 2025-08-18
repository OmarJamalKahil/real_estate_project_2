import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyPhotos } from './entities/property_photos.entity';
import { PropertyAttribute } from './entities/property_attribute.entity';
import { PropertyTypeAttribute } from './entities/propertyType_attribute.entity';
import { LicenseDetails } from './entities/license_details.entity';
import { LicenseType } from '../license-type/entities/license_type.entity';
import { Location } from './entities/location.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { OfficeModule } from 'src/office/office.module';
import { UserModule } from 'src/user/user.module';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { Attribute } from 'src/attribute/entities/attribute.entity';
import { PaymentCardModule } from 'src/payment-card/payment-card.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      PropertyPhotos,
      PropertyAttribute,
      PropertyType,
      PropertyTypeAttribute,
      LicenseDetails,
      LicenseType,
      Location,
      Attribute,
    ]),
    NotificationModule,
    OfficeModule,
    UserModule,
    PaymentCardModule

  ],
  controllers: [PropertyController],
  providers: [PropertyService, CloudinaryService],
  exports:[PropertyService]
})
export class PropertyModule {}

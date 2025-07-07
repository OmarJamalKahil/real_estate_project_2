import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyPhotos } from './entities/property_photos.entity';
import { PropertyAttribute } from './entities/property_attribute.entity';
import { Attribute } from './entities/attribute.entity';
import { PropertyType } from './entities/property_type.entity';
import { PropertyTypeAttribute } from './entities/propertyType_attribute.entity';
import { LicenseDetails } from './entities/license_details.entity';
import { LicenseType } from './entities/license_type.entity';
import { Location } from './entities/location.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      PropertyPhotos,
      PropertyAttribute,
      Attribute,
      PropertyType,
      PropertyTypeAttribute,
      LicenseDetails,
      LicenseType,
      Location,
    ]),
  ],
  controllers: [PropertyController],
  providers: [PropertyService, CloudinaryService],
})
export class PropertyModule {}

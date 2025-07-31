import { Module } from '@nestjs/common';
import { PropertyTypeService } from './property-type.service';
import { PropertyTypeController } from './property-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyType } from './entities/property-type.entity';
import { Property } from 'src/property/entities/property.entity';
import { Attribute } from 'src/attribute/entities/attribute.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      PropertyType,Attribute,Property
    ])
  ],
  controllers: [PropertyTypeController],
  providers: [PropertyTypeService],
})
export class PropertyTypeModule {}

import { Module } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributeController } from './attribute.controller';
import { Attribute } from './entities/attribute.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { PropertyTypeAttribute } from 'src/property/entities/propertyType_attribute.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Attribute,PropertyType,PropertyTypeAttribute
    ]),
    
  ],
  controllers: [AttributeController],
  providers: [AttributeService],
})
export class AttributeModule {}

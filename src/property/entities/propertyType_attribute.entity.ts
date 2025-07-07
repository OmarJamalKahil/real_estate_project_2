import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { PropertyType } from './property_type.entity';
import { Attribute } from './attribute.entity';

@Entity()
export class PropertyTypeAttribute {
  @PrimaryGeneratedColumn('uuid')
  uniqueId: string;

  @ManyToOne(() => PropertyType, (pt) => pt.attributes)
  propertyType: PropertyType;

  @ManyToOne(() => Attribute, (a) => a.propertyTypeAttributes)
  attribute: Attribute;
}

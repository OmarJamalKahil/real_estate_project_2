import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { Attribute } from 'src/attribute/entities/attribute.entity';

@Entity()
export class PropertyTypeAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PropertyType, (pt) => pt.attributes)
  propertyType: PropertyType;

  @ManyToOne(() => Attribute, (a) => a.propertyAttributes)
  attribute: Attribute;
}

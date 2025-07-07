import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { Attribute } from './attribute.entity';

@Entity()
export class PropertyAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.propertyAttributes)
  property: Property;

  @ManyToOne(() => Attribute, (attr) => attr.propertyAttributes)
  attribute: Attribute;

  @Column()
  value: string;
}

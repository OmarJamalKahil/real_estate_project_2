import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { Property } from './property.entity';
import { Exclude } from 'class-transformer';
import { Attribute } from 'src/attribute/entities/attribute.entity';

@Entity()
export class PropertyAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.propertyAttributes, { eager: false })
  @Exclude()
  property: Property;

  @ManyToOne(() => Attribute, (attr) => attr.propertyAttributes)
  // @OneToOne(()=> Property)
  attribute: Attribute;

  @Column()
  value: number;
}

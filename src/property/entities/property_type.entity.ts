import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Property } from './property.entity';
import { PropertyTypeAttribute } from './propertyType_attribute.entity';

@Entity()
export class PropertyType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Property, (property) => property.type)
  properties: Property[];

  @OneToMany(() => PropertyTypeAttribute, (pta) => pta.propertyType)
  attributes: PropertyTypeAttribute[];
}

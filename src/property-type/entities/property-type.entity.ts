import { Attribute } from 'src/attribute/entities/attribute.entity';
import { Property } from 'src/property/entities/property.entity';
import { PropertyTypeAttribute } from 'src/property/entities/propertyType_attribute.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';


@Entity()
export class PropertyType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Property, (property) => property.propertyType)
  properties: Property[];

  @OneToMany(() => PropertyTypeAttribute, (pta) => pta.propertyType)
  attributes: PropertyTypeAttribute[];



}

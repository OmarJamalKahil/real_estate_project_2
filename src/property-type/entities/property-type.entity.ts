import { Attribute } from 'src/attribute/entities/attribute.entity';
import { Property } from 'src/property/entities/property.entity';
import { PropertyTypeAttribute } from 'src/property/entities/propertyType_attribute.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';





export enum TypeOfPropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  AGRICULTURAL = 'agricultural',
  INDUSTRIAL = 'industrial'
}


@Entity()
export class PropertyType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: TypeOfPropertyType
  })
  type: TypeOfPropertyType;

  @OneToMany(() => Property, (property) => property.type)
  properties: Property[];

  @OneToMany(() => PropertyTypeAttribute, (pta) => pta.propertyType)
  attributes: PropertyTypeAttribute[];



}

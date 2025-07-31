import { Attribute } from 'src/attribute/entities/attribute.entity';
import { Property } from 'src/property/entities/property.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';


@Entity()
export class PropertyType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Property, (property) => property.type)
  properties: Property[];

  // @OneToMany(() => PropertyTypeAttribute, (pta) => pta.propertyType)
  // attributes: PropertyTypeAttribute[];

  @ManyToMany(() => Attribute)
  attributes: Attribute[];

}

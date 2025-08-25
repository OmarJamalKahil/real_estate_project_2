import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { PropertyAttribute } from 'src/property/entities/property_attribute.entity';
import { PropertyTypeAttribute } from 'src/property/entities/propertyType_attribute.entity';

export enum AttributeType {
  boolean = 'boolean',
  number = 'number',
}

@Entity()
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: AttributeType
  })
  type: AttributeType;

  @OneToMany(() => PropertyAttribute, (pa) => pa.attribute)
  propertyAttributes: PropertyAttribute[];

  @OneToMany(() => PropertyTypeAttribute, (pta) => pta.attribute)
  propertyTypeAttributes: PropertyTypeAttribute[];

}




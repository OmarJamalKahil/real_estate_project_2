import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { PropertyAttribute } from './property_attribute.entity';
import { PropertyTypeAttribute } from './propertyType_attribute.entity';
import { PropertyType } from './property_type.entity';

@Entity()
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => PropertyAttribute, (pa) => pa.attribute)
  propertyAttributes: PropertyAttribute[];
  
  
  @ManyToMany(() => PropertyType)
  propertyType: PropertyType[];
}



// @Column({ default: false })
// isUnique: boolean;

// @OneToMany(() => PropertyTypeAttribute, (pta) => pta.attribute)
// propertyTypeAttributes: PropertyTypeAttribute[];
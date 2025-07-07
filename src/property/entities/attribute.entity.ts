import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PropertyAttribute } from './property_attribute.entity';
import { PropertyTypeAttribute } from './propertyType_attribute.entity';

@Entity()
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  isUnique: boolean;

  @OneToMany(() => PropertyAttribute, (pa) => pa.attribute)
  propertyAttributes: PropertyAttribute[];

  @OneToMany(() => PropertyTypeAttribute, (pta) => pta.attribute)
  propertyTypeAttributes: PropertyTypeAttribute[];
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { PropertyAttribute } from 'src/property/entities/property_attribute.entity';

@Entity()
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => PropertyAttribute, (pa) => pa.attribute)
  propertyAttributes: PropertyAttribute[];
  
  
  @ManyToMany(() => PropertyType)
  @JoinTable()
  propertyType: PropertyType[];
}



// @Column({ default: false })
// isUnique: boolean;

// @OneToMany(() => PropertyTypeAttribute, (pta) => pta.attribute)
// propertyTypeAttributes: PropertyTypeAttribute[];
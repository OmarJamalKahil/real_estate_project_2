import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class PropertyPhotos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.photos,{eager:false})
  property: Property;

  @Column()
  public_id: string;

  @Column() 
  url: string;
}
  
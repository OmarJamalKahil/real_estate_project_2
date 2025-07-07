import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Property } from './property.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  governorate: string;

  @Column()
  province: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @OneToMany(() => Property, (property) => property.location)
  properties: Property[];
}

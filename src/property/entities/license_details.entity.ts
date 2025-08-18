import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { LicenseType } from '../../license-type/entities/license_type.entity';
import { Property } from './property.entity';

@Entity()
export class LicenseDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LicenseType, (license) => license.licenseDetails,{eager:true})
  @JoinColumn()
  license: LicenseType;

  // @ManyToOne(() => Property, (property) => property.licenseDetails)4
  @OneToOne(() => Property,(property)=> property.licenseDetails )
  property: Property;

  @Column()
  licenseNumber: string;

  @Column()
  date: Date;
}

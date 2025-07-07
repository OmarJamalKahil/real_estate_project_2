import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LicenseType } from './license_type.entity';
import { Property } from './property.entity';

@Entity()
export class LicenseDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LicenseType, (license) => license.licenseDetails)
  license: LicenseType;

  @ManyToOne(() => Property, (property) => property.licenseDetails)
  property: Property;

  @Column()
  licenseNumber: string;

  @Column({ type: 'timestamp' })
  date: Date;
}

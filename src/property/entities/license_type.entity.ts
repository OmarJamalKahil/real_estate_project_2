import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LicenseDetails } from './license_details.entity';

@Entity()
export class LicenseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => LicenseDetails, (details) => details.license)
  licenseDetails: LicenseDetails[];
}

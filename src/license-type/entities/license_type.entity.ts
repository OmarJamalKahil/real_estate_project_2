import { LicenseDetails } from 'src/property/entities/license_details.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class LicenseType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true
  })
  name: string;

  @OneToMany(() => LicenseDetails, (details) => details.license)
  licenseDetails: LicenseDetails[];
}

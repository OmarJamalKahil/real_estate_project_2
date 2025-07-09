import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { PropertyType } from './property_type.entity';
import { Location } from './location.entity';
import { PropertyPhotos } from './property_photos.entity';
import { LicenseDetails } from './license_details.entity';
import { PropertyAttribute } from './property_attribute.entity';
import { Office } from 'src/office/entities/office.entity';
import { User } from 'src/user/entities/user.entity';
import { PropertyStatus } from '../common/property-status.enum';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @ManyToOne(() => Office, (office) => office.properties)
  office: Office;

  @Column({
    unique: true,
    nullable: false
  })
  propertyNumber: string;


  @Column()
  space: number;

  @Column('decimal')
  price: number;

  @Column('text')
  description: string;

  @ManyToOne(() => PropertyType, (pt) => pt.properties)
  type: PropertyType;


  @OneToOne(() => Location, { nullable: false })
  @JoinColumn()
  location: Location;

  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column({
    type:'enum',
    enum:PropertyStatus,
    default: PropertyStatus.Pending
  })
  status: PropertyStatus;

  @Column({ default: false })
  softDelete: boolean;

  // @Column()
  // owner: string;


  @ManyToOne(() => User, (user) => user.properties)
  owner: User;

  @OneToMany(() => PropertyPhotos, (photo) => photo.property)
  photos: PropertyPhotos[];

  @OneToOne(() => LicenseDetails, (licenseDetails) => licenseDetails.property)
  @JoinColumn()
  licenseDetails: LicenseDetails;

  @OneToMany(() => PropertyAttribute, (pa) => pa.property)
  propertyAttributes: PropertyAttribute[];
}

// @ManyToOne(() => Location, (location) => location.properties)
// location: Location;
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { PropertyType } from './property_type.entity';
import { Location } from './location.entity';
import { PropertyPhotos } from './property_photos.entity';
import { LicenseDetails } from './license_details.entity';
import { PropertyAttribute } from './property_attribute.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  officeId: string;

  @Column({
    unique:true,
    nullable:false
  })
  propertyNumber: string;

  // @Column()
  // type: string;

  @Column()
  space: string;

  @Column('decimal')
  price: number;

  @Column('text')
  description: string;

  @ManyToOne(() => PropertyType, (pt) => pt.properties)
  type: PropertyType;

  @ManyToOne(() => Location, (location) => location.properties)
  location: Location;

  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column()
  status: string;

  @Column({ default: false })
  softDelete: boolean;

  @Column()
  clientId: string;

  @OneToMany(() => PropertyPhotos, (photo) => photo.property)
  photos: PropertyPhotos[];

  @OneToMany(() => LicenseDetails, (ld) => ld.property)
  licenseDetails: LicenseDetails[];

  @OneToMany(() => PropertyAttribute, (pa) => pa.property)
  propertyAttributes: PropertyAttribute[];
}

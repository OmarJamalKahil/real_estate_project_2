// src/property/entities/property.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm'; // Import DeleteDateColumn
import { Location } from './location.entity';
import { PropertyPhotos } from './property_photos.entity';
import { LicenseDetails } from './license_details.entity';
import { PropertyAttribute } from './property_attribute.entity';
import { Office } from 'src/office/entities/office.entity';
import { User } from 'src/user/entities/user.entity';
import { EnumStatus } from '../common/property-status.enum';
import { PropertyComment } from 'src/property-comment/entities/property-comment.entity';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { PropertyTypeOperation } from '../common/property-type-operation.enum';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { RentalExpirationDate } from 'src/property-request/entities/rental-expiration-date.entity';
import { PropertyComplaint } from 'src/property-complaint/entities/property-complaint.entity';
import { UserProperty } from 'src/user/entities/user-property.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Office, (office) => office.properties)
  office: Office;

  @Column({
    nullable: false,
  })
  propertyNumber: string;

  @Column({
    type: 'enum',
    enum: PropertyTypeOperation,
    default: PropertyTypeOperation.Selling,
  })
  typeOperation: PropertyTypeOperation;

  @Column()
  space: number;

  @Column('decimal')
  price: number;

  @Column('text')
  description: string;

  @ManyToOne(() => PropertyType, (pt) => pt.properties)
  type: PropertyType;

  @OneToOne(() => Location, { nullable: false, cascade: true }) // Consider cascading for Location
  @JoinColumn()
  location: Location;

  @Column({ type: 'timestamp' })
  publishDate: Date;

  @Column({
    type: 'enum',
    enum: EnumStatus,
    default: EnumStatus.Pending,
  })
  status: EnumStatus;

  @Column({ default: false })
  softDelete: boolean;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  owner: string;

  @OneToOne(
    () => RentalExpirationDate,
    (rentalExpirationDate) => rentalExpirationDate.property,
  )
  rentalExpirationDate: RentalExpirationDate;

  // IMPORTANT: For one-to-one relations that should also be soft-deleted
  // or managed on deletion, you might need to handle them in your service.
  // cascade: true with onDelete: 'SET NULL' on PropertyAttribute is fine,
  // but for LicenseDetails you might want to either soft-delete it too,
  // or make sure it's not strictly coupled if the property is soft-deleted.
  @OneToMany(() => PropertyPhotos, (photo) => photo.property, { cascade: true }) // Cascade for photos if they should be deleted with property (or soft-deleted via separate logic)
  photos: PropertyPhotos[];

  // Consider { cascade: ['insert', 'update'] } for LicenseDetails if it's created/updated with property.
  // For deletion, if you soft-delete Property, LicenseDetails will remain. You'd need to soft-delete it separately if desired.
  @OneToOne(() => LicenseDetails, (licenseDetails) => licenseDetails.property, {
    nullable: true,
    onDelete: 'CASCADE',
  }) // If property is hard-deleted, license details should also be deleted
  @JoinColumn()
  licenseDetails: LicenseDetails;

  @OneToOne(() => Reservation, (reservation) => reservation.property) // Or handle reservation soft-deletion if it applies
  reservation: Reservation;

  // onDelete: 'SET NULL' means when a Property is deleted (hard or soft),
  // the propertyId in PropertyAttribute will become NULL.
  // If you want PropertyAttribute to stay linked even after soft delete, don't use onDelete.
  // If you want PropertyAttribute to be soft-deleted too, you'd apply @DeleteDateColumn to PropertyAttribute.
  @OneToMany(() => PropertyAttribute, (pa) => pa.property, {
    onDelete: 'CASCADE',
  }) // Usually, attributes belong to the property and should be removed/soft-deleted with it
  propertyAttributes: PropertyAttribute[];

  @OneToMany(
    () => PropertyComment,
    (propertyComment) => propertyComment.property,
    { onDelete: 'SET NULL' },
  ) // Comments might remain or be soft-deleted separately
  comments?: PropertyComment[];

  @Column({
    type: 'date',
    default: new Date(),
  })
  createdAt: Date;

  @OneToMany(
    () => PropertyComplaint,
    (propertyComplaints) => propertyComplaints.property,
  )
  propertyComplaints: PropertyComplaint;

  @OneToMany(() => UserProperty, (userProperties) => userProperties.property)
  userProperties: UserProperty[];
}

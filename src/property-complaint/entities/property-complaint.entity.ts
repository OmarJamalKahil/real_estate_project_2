import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertyComplaintPhoto } from './property-complaint-photo.entity';
import { User } from 'src/user/entities/user.entity';
import { Property } from 'src/property/entities/property.entity';

@Entity()
export class PropertyComplaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.propertyComplaints)
  @JoinColumn()
  property: Property;

  @ManyToOne(() => User, (user) => user.officeComplaints)
  @JoinColumn()
  user: User;

  @Column()
  content: string;

  @Column()
  date: Date;

  @Column()
  title: string;

  @OneToMany(
    () => PropertyComplaintPhoto,
    (propertyComplaintPhotos) => propertyComplaintPhotos.propertyComplaint,
  )
  propertyComplaintPhotos: PropertyComplaintPhoto[];
}

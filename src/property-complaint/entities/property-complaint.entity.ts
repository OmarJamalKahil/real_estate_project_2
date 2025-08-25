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
import { ComplaintStatus } from '../enum/complaint-status.enum';

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

  @Column({
    type: 'date',
    default: new Date(),
  })
  date: Date;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.Pending,
  })
  status: ComplaintStatus;

  @OneToMany(
    () => PropertyComplaintPhoto,
    (propertyComplaintPhotos) => propertyComplaintPhotos.propertyComplaint,
  )
  propertyComplaintPhotos: PropertyComplaintPhoto[];
}

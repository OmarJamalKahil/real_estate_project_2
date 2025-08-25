import { IsUUID } from 'class-validator';
import { Office } from 'src/office/entities/office.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OfficeComplaintPhoto } from './office-complaint-photo.entity';
import { User } from 'src/user/entities/user.entity';
import { ComplaintStatus } from 'src/property-complaint/enum/complaint-status.enum';

@Entity()
export class OfficeComplaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Office, (office) => office.officeComplaints)
  @JoinColumn()
  office: Office;

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
    () => OfficeComplaintPhoto,
    (officeComplaintPhoto) => officeComplaintPhoto.officeComplaint,
  )
  officeComplaintPhotos: OfficeComplaintPhoto[];
}

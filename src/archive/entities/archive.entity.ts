import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Location } from 'src/property/entities/location.entity';
import { Record } from './record.entity';
import { ArchiveStatus } from '../enum/archive-status.entity';

@Entity()
export class Archive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  property_Number: string;

  @Column()
  propertyType: string;

  @Column()
  typeOfPropertyType: string;

  @Column()
  space: string;

  @Column({
    type: 'enum',
    enum: ArchiveStatus,
    default: ArchiveStatus.PENDING,
  })
  status: ArchiveStatus;

  @OneToOne(() => Location)
  @JoinColumn()
  location: Location;

  @OneToMany(() => Record, (records) => records.archive)
  records: Record[];
}

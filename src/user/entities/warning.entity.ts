import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserWarnings } from './user-warnings.entity';

@Entity()
export class Warning {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reason: string;

  @Column()
  warn_end_time: Date;

  @ManyToOne(() => UserWarnings, userWarnings => userWarnings.warnings)
  userWarnings: UserWarnings;
}

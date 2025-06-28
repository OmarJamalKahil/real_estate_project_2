import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, Check } from 'typeorm';
import { User } from './user.entity';
import { Warning } from './warning.entity';



@Check(`"report_counts" <= 3`)  // Postgres constraint
@Entity()
export class UserWarnings {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  report_counts: number;
 
  @OneToOne(() => User, user => user.userWarnings)
  user: User;

  @OneToMany(() => Warning, warning => warning.userWarnings, { cascade: true })
  warnings: Warning[];
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Banned {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reason: string;

  @Column()
  date: Date;
}

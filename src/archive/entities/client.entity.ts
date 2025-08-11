import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Archive } from "./archive.entity";


@Entity()
export class Client{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    personal_Identity_Number: number;
    
    @Column()
    name: string;

    @OneToOne(() => Archive)
    @JoinColumn()
    archive: Archive;
}
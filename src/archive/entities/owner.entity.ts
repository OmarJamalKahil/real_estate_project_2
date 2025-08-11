import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Archive } from "./archive.entity";
import { Client } from "./client.entity";
import { PropertyTypeOperation } from "src/property/common/property-type-operation.enum";


@Entity()
export class Owner{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    personal_Identity_Number: number;
    
    @Column()
    name: string;

    @Column()
    price: number;

    @Column()
    date: Date;

    @Column()
    type: PropertyTypeOperation;

    @Column({nullable: true, type: 'timestamp'})
    sell_Date: Date | null;

    @Column({nullable: true, type: 'timestamp'})
    rental_Start_Date: Date | null;

    @Column({nullable: true, type: 'timestamp'})
    rental_End_Date: Date | null;

    @OneToOne(() => Archive)
    @JoinColumn()
    archive: Archive;

    @OneToOne(() => Client)
    @JoinColumn()
    client: Client;
}
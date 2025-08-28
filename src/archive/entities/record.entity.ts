import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Archive } from "./archive.entity";
import { PropertyTypeOperation } from "src/property/common/property-type-operation.enum";


@Entity()
export class Record{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    owner_personal_Identity_Number: number;
    
    @Column()
    owner_name: string;

    @Column()
    client_personal_Identity_Number: number;
    
    @Column()
    client_name: string;

    @Column()
    price: number;

    @Column({type: 'enum', enum: PropertyTypeOperation})
    type: PropertyTypeOperation;

    @Column({nullable: true, type: 'timestamp'})
    sell_Date: Date | null;

    @Column({nullable: true, type: 'timestamp'})
    rental_Start_Date: Date | null;

    @Column({nullable: true, type: 'timestamp'})
    rental_End_Date: Date | null;

    @ManyToOne(() => Archive, (archive) => archive.records)
    @JoinColumn()
    archive: Archive;

}
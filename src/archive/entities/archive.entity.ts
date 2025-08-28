import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Location } from "src/property/entities/location.entity";
import { Record } from "./record.entity";

@Entity()
export class Archive{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'int'})
    property_Number: number;

    @Column()
    propertyType: string;

    @Column()
    typeOfPropertyType: string;

    @Column()
    space: string;

    @OneToOne(() => Location)
    @JoinColumn()
    location: Location;

    @OneToMany(()=> Record, (records) => records.archive)
    records: Record[];
}
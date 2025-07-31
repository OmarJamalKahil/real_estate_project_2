import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Location } from "src/property/entities/location.entity";

@Entity()
export class Archive{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'int'})
    property_Number: number;

    @OneToOne(() => Location)
    @JoinColumn()
    location: Location;


}
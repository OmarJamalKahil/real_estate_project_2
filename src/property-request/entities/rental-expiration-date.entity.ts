import { Property } from "src/property/entities/property.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class RentalExpirationDate {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    expireDate: Date;

    @OneToOne(() => Property,(property)=> property.rentalExpirationDate)
    @JoinColumn()
    property: Property


}



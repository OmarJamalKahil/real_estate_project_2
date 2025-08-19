import { Property } from "src/property/entities/property.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";


export enum OperationTypeStatistics {
    selling = 'selling',
    renting = 'renting',
    deleting = 'deleting',
    reservation = 'reservation'
}



@Entity()
export class PropertyStatistics {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Property, { nullable: true })
    @JoinColumn()
    property?: Property;

    @Column({
        type: 'enum',
        enum: OperationTypeStatistics,
    })
    operationType: OperationTypeStatistics;

    @Column({
        type: 'numeric',
    })
    amount: number;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date

}
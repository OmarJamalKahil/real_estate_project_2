import { Subscription } from "src/subscription/entities/subscription.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class generalStatistics {

    @PrimaryGeneratedColumn('uuid')
    id: string;

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
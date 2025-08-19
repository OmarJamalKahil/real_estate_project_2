import { Subscription } from "src/subscription/entities/subscription.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class SubscriptionStatistics {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Subscription)
    @JoinColumn()
    subscription: Subscription;

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
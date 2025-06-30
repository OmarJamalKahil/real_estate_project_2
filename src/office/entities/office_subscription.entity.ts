import { Subscription } from "src/subscription/entities/subscription.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class OfficeSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @OneToOne(() => Subscription)
    @JoinColumn()
    subscription: Subscription;

    @Column({
        nullable: false,
    })
    current_number_propert: number;

    @Column({
        nullable: false,
    })
    remaining_properties: number;

    @Column({
        nullable: false,
    })
    current_number_promotions: number;


    @Column({
        nullable: false,
    })
    remaining_promotions: number;


    @Column({
        nullable: false,
    })
    start_date: Date;


    @Column({
        nullable: false,
    })
    end_date: Date;
}




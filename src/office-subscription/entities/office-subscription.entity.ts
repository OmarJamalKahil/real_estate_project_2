import { Office } from "src/office/entities/office.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class OfficeSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // OfficeSubscription entity
    @OneToOne(() => Office, (office) => office.officeSubscription, { onDelete: 'CASCADE' })
    @JoinColumn() // owning side
    office: Office;




    @ManyToOne(() => Subscription, (subscription) => subscription.officeSubscriptions, { eager: true })
    subscription: Subscription;

    @Column()
    start_date: Date;

    @Column()
    end_date: Date;

    @Column()
    current_number_property: number;

    @Column()
    remaining_properties: number;

    @Column()
    current_number_promotions: number;

    @Column()
    remaining_promotions: number;
}
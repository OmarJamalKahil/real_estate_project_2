import { OfficeSubscription } from "src/office-subscription/entities/office-subscription.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


export enum Durations {
    OneMonth = '1 Mon',
    TwoMonthes = '2 Mon',
    ThreeMonthes = '3 Mon',
    SixMonthes = '6 Mon',
    OneYear = '1 Year'

}


@Entity()
export class Subscription {


    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string;

    @Column({
        type: 'numeric'
    })
    price: number;

    @Column({
        type: 'text'
    })
    description: string;

    @Column()
    propertyNumber: number;

    @Column()
    numberOfPromotion: number;

    @Column({
        type: 'enum',
        enum: Durations
    })
    duration: Durations;


    // @OneToMany(() => OfficeSubscription, (officeSubscription) => officeSubscription.subscription)
    // officeSubscription?: OfficeSubscription[]


    @OneToMany(() => OfficeSubscription, (os) => os.subscription)
    officeSubscriptions: OfficeSubscription[];


}


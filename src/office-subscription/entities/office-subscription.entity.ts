import { Office } from "src/office/entities/office.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";


// @Entity()
// export class OfficeSubscription {
//     @PrimaryGeneratedColumn('uuid')
//     id: string

//     @OneToOne(() => Office,{nullable:false})
//     office: Office;


//     @ManyToOne(() => Subscription, (subscription) => subscription.officeSubscription)
//     subscription: Subscription;

//     @Column({
//         nullable: false,
//     })
//     current_number_property: number;

//     @Column({
//         nullable: false,
//     })
//     remaining_properties: number;

//     @Column({
//         nullable: false,
//     })
//     current_number_promotions: number;


//     @Column({
//         nullable: false,
//     })
//     remaining_promotions: number;


//     @Column({
//         nullable: false,
//     })
//     start_date: Date;


//     @Column({
//         nullable: false,
//     })
//     end_date: Date;
// }






@Entity()
export class OfficeSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Office, (office) => office.officeSubscription)
    // @JoinColumn() // owns the foreign key
    office: Office;

    @ManyToOne(() => Subscription, (subscription) => subscription.officeSubscriptions, { eager: false })
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

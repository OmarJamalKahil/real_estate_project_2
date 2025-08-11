import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class EarningStatistics{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    start_of_the_week: Date;

    @Column()
    end_of_the_week: Date;

    @Column()
    status: boolean;

    
    @Column()
    total_profit: number;

    @Column()
    average_profit_from_deals: number;

    @Column()
    total_profit_from_sales: number;

    @Column()
    average_sale_transaction_profit: number;

    @Column()
    highest_selling_profit: number;

    @Column()
    lowest_selling_profit: number;



    @Column()
    total_profit_from_rents: number;

    @Column()
    average_rent_transaction_profit: number;

    @Column()
    highest_renting_profit: number;

    @Column()
    lowest_renting_profit: number;

    @Column()
    total_subscription_profit: number;

    @Column()
    total_property_delete_profit: number;
 
}
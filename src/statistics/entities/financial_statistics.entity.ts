import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class FinancialStatistics{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    start_of_the_week: Date;

    @Column()
    end_of_the_week: Date;

    @Column()
    status: boolean;

    @Column()
    total_sales: number;

    @Column()
    standard_deviation_for_sales: number;

    @Column()
    highest_selling_price: number;

    @Column()
    lowest_selling_price: number;



    @Column()
    total_rents: number;

    @Column()
    standard_deviation_for_rents: number;

    @Column()
    highest_renting_price: number;

    @Column()
    lowest_renting_price: number;
}
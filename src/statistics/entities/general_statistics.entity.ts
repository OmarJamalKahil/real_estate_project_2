import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class GeneralStatistics{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    start_of_the_week: Date;

    @Column()
    end_of_the_week: Date;

    @Column()
    status: boolean;


    
    @Column()
    total_properties_in_archive: number;
        
    @Column()
    sold_properties: number;

    @Column()
    rented_properties: number;



    @Column()
    available_properties: number;

    @Column()
    sale_properties: number;

    @Column()
    sell_deals_this_week: number;




    @Column()
    rent_properties: number;
    
    @Column()
    rent_deal_this_week: number;

}
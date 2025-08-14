import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GeneralStatistics } from "../entities/general_statistics.entity";
import { Repository } from "typeorm";
import { Archive } from "src/archive/entities/archive.entity";
import { Owner } from "src/archive/entities/owner.entity";
import { Property } from "src/property/entities/property.entity";
import { PropertyTypeOperation } from "src/property/common/property-type-operation.enum";
import { EnumStatus } from "src/property/common/property-status.enum";


@Injectable()
export class GeneralStatisticsService{

    constructor(
        @InjectRepository(GeneralStatistics)
        private readonly generalStatisticsRepository: Repository<GeneralStatistics>,

        @InjectRepository(Archive)
        private readonly archiveRepository: Repository<Archive>,

        @InjectRepository(Owner)
        private readonly ownerRepository: Repository<Owner>,

        @InjectRepository(Property)
        private readonly propertyRepository: Repository<Property>
    ){}

    public async createFirstStatistic(){

        const start_of_the_week = new Date();

        const end_of_the_week = new Date();


        // if( end_of_the_week)
        //     return true;
        //return start_of_the_week();

        //console.log('${start_of_the_week} + ${end_of_the_week}');


        const properties_in_archive = await this.archiveRepository.find(
            //{relations:['owner']}
        );

        const owners = await this.ownerRepository.find();

        console.log(properties_in_archive);

        var sold = 0 , rented = 0;

        for(const owner of owners){
            if(owner.type == PropertyTypeOperation.Selling){
                sold++;
            }
            else{
                rented++;
            }
        }

        const properties = await this.propertyRepository.find();

        var availableProperties = 0 , sale = 0 , rent = 0;



        for(const property of properties){
            if(property.status == EnumStatus.Accepted && property.typeOperation == PropertyTypeOperation.Selling){
                availableProperties++;
                sale++;
            }
            else if(property.status == EnumStatus.Accepted && property.typeOperation == PropertyTypeOperation.Renting){
                availableProperties++;
                rent++;
            }
        }

        const general_statistics = await this.generalStatisticsRepository.create({
            total_properties_in_archive: properties_in_archive.length,
            sold_properties: sold,
            rented_properties: rented,
            available_properties: availableProperties,
            sale_properties: sale,
            rent_properties: rent
        });

        this.generalStatisticsRepository.save(general_statistics);

        return general_statistics;
        
    }


    public async updateStatistic(type: PropertyTypeOperation){

        //const general_statistics = await this.
    }
}
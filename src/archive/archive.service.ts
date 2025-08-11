import { Injectable } from "@nestjs/common";
import { CreateArchiveDto } from "./dto/create_Archive.dto";
import { OwnerDto } from "./dto/owner.dto";
import { ClientDto } from "./dto/client.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Archive } from "./entities/archive.entity";
import { Repository } from "typeorm";
import { Owner } from "./entities/owner.entity";
import { Client } from "./entities/client.entity";
import { GeneralStatisticsService } from "src/statistics/services/general_statistics.service";


@Injectable()
export class ArchiveService{

    constructor(
        @InjectRepository(Archive)
        private readonly archiveRepository: Repository<Archive>,

        @InjectRepository(Owner)
        private readonly ownerRepository: Repository<Owner>,

        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,

        private readonly generalStatisticsService: GeneralStatisticsService
        
    ){}

    /**
     * this method is to add a new done property and to the archive,
     * or add a new data to an existed property in the archive
      
     * @param createArchiveDto data for the archive
     * @param ownerDto data for the owner
     * @param clientDto date for the client
     * @returns a successfull add or failed add message
     */

    public async addPropertyToArchive(
        createArchiveDto: CreateArchiveDto,
        ownerDto: OwnerDto,
        clientDto: ClientDto
    ){

        const {property_Number , location_Id} = createArchiveDto;

        const {
            owner_personal_Identity_Number,
            owner_name,
            price,
            date,
            type,
            sell_Date,
            rental_Start_Date,
            rental_End_Date
        } = ownerDto;

        const {
            client_personal_Identity_Number,
            client_name
        } = clientDto; 

        var archive = await this.archiveRepository.findOne({
            where: {property_Number: property_Number}
        });

        if(!archive){
            archive = this.archiveRepository.create({
                property_Number: property_Number,
                location: location_Id
            });

            await this.archiveRepository.save(archive);
        }

        const client = this.clientRepository.create({
            personal_Identity_Number: client_personal_Identity_Number,
            name: client_name,
            archive: archive
        });

        await this.clientRepository.save(client);


        const owner = this.ownerRepository.create({
            personal_Identity_Number: owner_personal_Identity_Number,
            name : owner_name,
            price: price,
            date: date,
            type: type,
            sell_Date: sell_Date,
            rental_Start_Date: rental_Start_Date,
            rental_End_Date: rental_End_Date,
            archive: archive,
            client: client
        });

        await this.ownerRepository.save(owner);

        this.generalStatisticsService.updateStatistic(type);

        return "A New Data added successfully to the archive";
    }
}

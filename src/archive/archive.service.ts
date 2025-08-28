import { Injectable } from '@nestjs/common';
import { CreateArchiveDto } from './dto/create_Archive.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Archive } from './entities/archive.entity';
import { Repository } from 'typeorm';
import { Record } from './entities/record.entity';
import { Location } from 'src/property/entities/location.entity';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectRepository(Archive)
    private readonly archiveRepository: Repository<Archive>,

    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,

    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

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
    createRecordDto: CreateRecordDto,
  ) {
    var archive = await this.archiveRepository.findOne({
      where: { property_Number: createArchiveDto.property_Number },
    });

    if (!archive) {
      const location = await this.locationRepository.findOne({
        where: { id: createArchiveDto.location_Id },
      });

      if (location)
        archive = await this.archiveRepository.create({
          property_Number: createArchiveDto.property_Number,
          propertyType: createArchiveDto.propertyType,
          typeOfPropertyType: createArchiveDto.typeOfPropertyType,
          space: createArchiveDto.space,
          location: location,
        });
    }

    var newRecord;

    if (archive) {
       newRecord = this.recordRepository.create({
        owner_personal_Identity_Number:
          createRecordDto.owner_personal_Identity_Number,
        owner_name: createRecordDto.owner_name,
        client_personal_Identity_Number:
          createRecordDto.client_personal_Identity_Number,
        client_name: createRecordDto.client_name,
        price: createRecordDto.price,
        type: createRecordDto.type,
        sell_Date: createRecordDto.sell_Date,
        rental_End_Date: createRecordDto.rental_End_Date,
        rental_Start_Date: createRecordDto.rental_Start_Date,
        archive: archive,
      });
    }

    return {message: "Archive Updated successfully"}
  }

  async getAllArchive(){
    return await this.archiveRepository.find({
        relations:['records']
    });
  }

  async getOneArchiveWithRecords(archiveId: string){
    const archive = await this.archiveRepository.findOne({
        where: {id: archiveId},
        relations: ['records']
    });

    return archive;
  }
}

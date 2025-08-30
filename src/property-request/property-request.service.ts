// import {
//   Injectable,
//   NotFoundException,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { DataSource, QueryRunner } from 'typeorm';
// import { EnumPropertyRequestStatus, PropertyRequest } from './entities/property-request.entity';
// import { PropertyRequestPhoto } from './entities/property-request-photo.entity';
// import { CreatePropertyRequestDto } from './dto/create-property-request.dto';
// import { UpdatePropertyRequestDto } from './dto/update-property-request.dto';
// import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
// import { CreateRentalExpirationDateDto } from './dto/create-rental-expiration-date.dto';
// import { PropertyTypeOperation } from 'src/property/common/property-type-operation.enum';
// import { Property } from 'src/property/entities/property.entity';
// import { RentalExpirationDate } from './entities/rental-expiration-date.entity';
// import { PropertyService } from 'src/property/property.service';
// import { EnumStatus } from 'src/property/common/property-status.enum';
// import { NotificationService } from 'src/notification/notification.service';
// import { UpdatePropertyRequestByAdminDto } from './dto/update-property-request-by-admin.dto';

// @Injectable()
// export class PropertyRequestService {
//   constructor(
//     private readonly dataSource: DataSource,
//     private readonly cloudinaryService: CloudinaryService,
//     private readonly propertyService: PropertyService,
//     private readonly notificationService: NotificationService,

//   ) { }

//   async create(
//     createDto: CreatePropertyRequestDto,
//     property_request_photos: Express.Multer.File[],
//   ) {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const propertyRequest = queryRunner.manager.create(PropertyRequest, {
//         typeOperation: createDto.typeOperation,
//         propertyNumber: createDto.propertyNumber,
//       });

//       await queryRunner.manager.save(propertyRequest);

//       if (property_request_photos?.length) {
//         const uploadedPhotos = await Promise.all(
//           property_request_photos.map((file) =>
//             this.cloudinaryService.uploadImage(file),
//           ),
//         );

//         const photos = uploadedPhotos.map((upload) =>
//           queryRunner.manager.create(PropertyRequestPhoto, {
//             url: upload.secure_url,
//             public_id: upload.public_id,
//             porpertyRequest: propertyRequest,
//           }),
//         );

//         await queryRunner.manager.save(PropertyRequestPhoto, photos);
//       }

//       await queryRunner.commitTransaction();
//       return propertyRequest;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException('Failed to create request');
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async findAll() {
//     return await this.dataSource.getRepository(PropertyRequest).find({
//       relations: ['photos'],
//     });
//   }

//   async findOne(id: string) {
//     const propertyRequest = await this.dataSource
//       .getRepository(PropertyRequest)
//       .findOne({
//         where: { id },
//         relations: ['photos'],
//       });

//     if (!propertyRequest) throw new NotFoundException('Request not found');
//     return propertyRequest;
//   }

//   async update(
//     id: string,
//     updateDto: UpdatePropertyRequestDto,
//     newPhotos: Express.Multer.File[],
//   ) {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const requestRepo = queryRunner.manager.getRepository(PropertyRequest);
//       const photoRepo = queryRunner.manager.getRepository(PropertyRequestPhoto);

//       const request = await requestRepo.findOne({
//         where: { id },
//         relations: ['photos'],
//       });

//       if (!request) throw new NotFoundException('Request not found');

//       request.typeOperation = updateDto.typeOperation ?? request.typeOperation;
//       request.propertyNumber = updateDto.propertyNumber ?? request.propertyNumber;

//       await requestRepo.save(request);

//       if (newPhotos?.length) {
//         // Delete old photos from Cloudinary and DB
//         await Promise.all(
//           request.photos.map((photo) =>
//             this.cloudinaryService.deleteImage(photo.public_id),
//           ),
//         );

//         await photoRepo.delete({ porpertyRequest: { id } });

//         // Upload new photos to Cloudinary
//         const uploadedPhotos = await Promise.all(
//           newPhotos.map((file) => this.cloudinaryService.uploadImage(file)),
//         );

//         const photoEntities = uploadedPhotos.map((upload) =>
//           photoRepo.create({
//             url: upload.secure_url,
//             public_id: upload.public_id,
//             porpertyRequest: request,
//           }),
//         );

//         await photoRepo.save(photoEntities);
//       }

//       await queryRunner.commitTransaction();
//       return request;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException('Failed to update request');
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async remove(id: string) {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const request = await queryRunner.manager.findOne(PropertyRequest, {
//         where: { id },
//         relations: ['photos'],
//       });

//       if (!request) throw new NotFoundException('Request not found');

//       // Delete Cloudinary images
//       if (request.photos?.length) {
//         await Promise.all(
//           request.photos.map((photo) =>
//             this.cloudinaryService.deleteImage(photo.public_id),
//           ),
//         );
//       }

//       await queryRunner.manager.delete(PropertyRequestPhoto, {
//         porpertyRequest: { id },
//       });

//       await queryRunner.manager.delete(PropertyRequest, { id });

//       await queryRunner.commitTransaction();
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException('Failed to delete request');
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async updatePropertyRequestByAdmin(
//     id: string,
//     updatePropertyRequestByAdminDto: UpdatePropertyRequestByAdminDto
//   ) {

//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {

//       const property = await queryRunner.manager.findOne(Property, {
//         where: {
//           propertyNumber: updatePropertyRequestByAdminDto.propertyNumber,
//         }, order: {
//           createdAt: 'DESC'
//         }, relations: ['office.user']
//       })

//       if (!property) {
//         throw new NotFoundException('property not found')
//       }

//       const propertyRequest = await queryRunner.manager.findOne(PropertyRequest, {
//         where: {
//           id
//         },
//       })

//       if (!propertyRequest) {
//         throw new NotFoundException('propertyRequest not found')
//       }

//       if (updatePropertyRequestByAdminDto.status === EnumPropertyRequestStatus.Rejected) {
//         propertyRequest.status = EnumPropertyRequestStatus.Rejected
//         await queryRunner.manager.save(propertyRequest);
//         this.notificationService.notifyUser(queryRunner, property.office.user.id, "Your property request has been rejected because we have found something illegaly.", 'Property Request Rejection')
//       } else if (
//         updatePropertyRequestByAdminDto.status === EnumPropertyRequestStatus.Accepted
//         && (updatePropertyRequestByAdminDto.propertyNumber)
//         && (updatePropertyRequestByAdminDto.expireDate)
//       ) {

//         await this.createRentalExpirationDate(queryRunner, {
//           propertyNumber: updatePropertyRequestByAdminDto.propertyNumber,
//           expireDate: updatePropertyRequestByAdminDto.expireDate
//         })

//       } else {

//         propertyRequest.status = EnumPropertyRequestStatus.Accepted
//         await queryRunner.manager.save(propertyRequest);
//         await this.propertyService.removePropertySoft(queryRunner, property.id)
//         await this.notificationService.notifyUser(queryRunner, property.office.user.id, "Your property request has been accepted.", 'Property Request Acception')

//       }

//       await queryRunner.commitTransaction();
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException('Failed to update request');
//     } finally {
//       await queryRunner.release();
//     }

//   }

//   async createRentalExpirationDate(queryRunner: QueryRunner, createRentalExpirationDto: CreateRentalExpirationDateDto) {

//     // const queryRunner = this.dataSource.createQueryRunner();
//     // await queryRunner.connect();
//     // await queryRunner.startTransaction();

//     // try {
//     const property = await queryRunner.manager.findOne(Property, {
//       where: {
//         propertyNumber: createRentalExpirationDto.propertyNumber,
//         typeOperation: PropertyTypeOperation.Renting
//       }, relations: ['office', 'office.user']
//     });
//     if (!property) {
//       throw new NotFoundException('property not found.')
//     }

//     const rentalExpirationDate = queryRunner.manager.create(RentalExpirationDate, {
//       property,
//       expireDate: createRentalExpirationDto.expireDate
//     })

//     property.status = EnumStatus.Rented;

//     await queryRunner.manager.save(property);
//     await queryRunner.manager.save(rentalExpirationDate);

//     this.propertyService.updatePropertyStatus(property.id, { status: EnumStatus.Rented })

//     this.notificationService.notifyUser(queryRunner, property.office.user.id, "Your rental property request has been accepted", "Rental Property")

//     await queryRunner.commitTransaction();

//     // } catch (error) {
//     //   await queryRunner.rollbackTransaction();
//     //   throw new InternalServerErrorException('Failed to create request');
//     // } finally {
//     //   await queryRunner.release();
//     // }

//   }
// }

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import {
  PropertyRequest,
  EnumPropertyRequestStatus,
} from './entities/property-request.entity';
import { PropertyRequestPhoto } from './entities/property-request-photo.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateRentalExpirationDateDto } from './dto/create-rental-expiration-date.dto';
import { PropertyTypeOperation } from 'src/property/common/property-type-operation.enum';
import { Property } from 'src/property/entities/property.entity';
//import { RentalExpirationDate } from './entities/rental-expiration-date.entity';
import { PropertyService } from 'src/property/property.service';
import { EnumStatus } from 'src/property/common/property-status.enum';
import { NotificationService } from 'src/notification/notification.service';
import { UpdatePropertyRequestByAdminDto } from './dto/update-property-request-by-admin.dto';
import { PropertyStatisticsService } from 'src/statistics/services/property-statistics.service';
import { GeneralStatisticsService } from 'src/statistics/services/general-statistics.service';
import {
  OperationTypeStatistics,
  PropertyStatistics,
} from 'src/statistics/entities/property-statistics.entity';
import { CreateArchiveDto } from 'src/archive/dto/create_Archive.dto';
import { CreateRecordDto } from 'src/archive/dto/create-record.dto';
import { ArchiveService } from 'src/archive/archive.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from 'src/archive/entities/record.entity';
import { Archive } from 'src/archive/entities/archive.entity';
import { ArchiveStatus } from 'src/archive/enum/archive-status.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { RentalExpirationDate } from './entities/rental-expiration-date.entity';
import { UserProperty } from 'src/user/entities/user-property.entity';

@Injectable()
export class PropertyRequestService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
    private readonly propertyService: PropertyService,
    private readonly notificationService: NotificationService,
    private readonly propertyStatisticsService: PropertyStatisticsService,
    private readonly generalStatisticsService: GeneralStatisticsService,
    private readonly archiveService: ArchiveService,

    @InjectRepository(Record)
    private readonly recordRepo: Repository<Record>,

    @InjectRepository(Archive)
    private readonly archiveRepo: Repository<Archive>,

    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,

    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(UserProperty)
    private readonly userPropertyRepo: Repository<UserProperty>,
  ) {}

  // async create(
  //   createDto: CreatePropertyRequestDto,
  //   propertyRequestPhotos: Express.Multer.File[],
  // ) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   const property = await this.propertyService.findOneByPropertyNumber(createDto.propertyNumber);

  //   try {
  //     const propertyRequest = queryRunner.manager.create(PropertyRequest, {
  //       //typeOperation: createDto.typeOperation,
  //       property: property
  //     });

  //     const photos: PropertyRequestPhoto[] = [];
  //     for (const file of propertyRequestPhotos) {
  //       const uploadRes = await this.cloudinaryService.uploadImage(file);
  //       const photo = queryRunner.manager.create(PropertyRequestPhoto, {
  //         propertyRequest,
  //         url: uploadRes.secure_url,
  //         public_id: uploadRes.public_id,
  //       });
  //       await queryRunner.manager.save(photo);
  //       photos.push(photo);
  //     }

  //     propertyRequest.photos = photos;

  //     await queryRunner.manager.save(propertyRequest);

  //     await queryRunner.commitTransaction();
  //     return propertyRequest;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     console.error(error);
  //     throw new InternalServerErrorException('Failed to create property request');
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async create(
    createArchiveDto: CreateArchiveDto,
    createRecordDto: CreateRecordDto,
    propertyRequestPhotos: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const property = await this.propertyRepo.findOne({
      where: {
        propertyNumber: createArchiveDto.property_Number,
        softDelete: false,
      },
    });

    try {
      const record = await this.archiveService.addPropertyToArchive(
        createArchiveDto,
        createRecordDto,
      );

      if (property) {
        const propertyRequest = queryRunner.manager.create(PropertyRequest, {
          //typeOperation: createDto.typeOperation,
          property: property,
          record: record,
        });

        const photos: PropertyRequestPhoto[] = [];
        for (const file of propertyRequestPhotos) {
          const uploadRes = await this.cloudinaryService.uploadImage(file);
          const photo = queryRunner.manager.create(PropertyRequestPhoto, {
            propertyRequest,
            url: uploadRes.secure_url,
            public_id: uploadRes.public_id,
          });
          await queryRunner.manager.save(photo);
          photos.push(photo);
        }

        propertyRequest.photos = photos;

        await queryRunner.manager.save(propertyRequest);
        await queryRunner.commitTransaction();
        return propertyRequest;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to create property request',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.dataSource.getRepository(PropertyRequest).find({
      where: {
        status: EnumPropertyRequestStatus.Pending,
      },
      relations: ['photos','property'],
    });
  }

  async findOne(id: string) {
    const propertyRequest = await this.dataSource
      .getRepository(PropertyRequest)
      .findOne({
        where: {
          id,
          status: EnumPropertyRequestStatus.Pending,
        },
        relations: ['photos'],
      });

    if (!propertyRequest)
      throw new NotFoundException('Property request not found');
    return propertyRequest;
  }

  // async update(
  //   id: string,
  //   updateDto: UpdatePropertyRequestDto,
  //   newPhotos: Express.Multer.File[],
  // ) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const requestRepo = queryRunner.manager.getRepository(PropertyRequest);
  //     const photoRepo = queryRunner.manager.getRepository(PropertyRequestPhoto);

  //     const request = await requestRepo.findOne({
  //       where: { id },
  //       relations: ['photos'],
  //     });

  //     if (!request) throw new NotFoundException('Property request not found');

  //     request.typeOperation = updateDto.typeOperation ?? request.typeOperation;
  //     request.propertyNumber = updateDto.propertyNumber ?? request.propertyNumber;

  //     await requestRepo.save(request);

  //     if (newPhotos?.length) {
  //       // Delete old photos
  //       await Promise.all(
  //         request.photos.map(photo =>
  //           this.cloudinaryService.deleteImage(photo.public_id),
  //         ),
  //       );

  //       await photoRepo.delete({ propertyRequest: { id } });

  //       const uploadedPhotos = await Promise.all(
  //         newPhotos.map(file => this.cloudinaryService.uploadImage(file)),
  //       );

  //       const newPhotoEntities = uploadedPhotos.map(upload =>
  //         photoRepo.create({
  //           url: upload.secure_url,
  //           public_id: upload.public_id,
  //           propertyRequest: request,
  //         }),
  //       );

  //       await photoRepo.save(newPhotoEntities);
  //     }

  //     await queryRunner.commitTransaction();
  //     return request;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     console.error(error);
  //     throw new InternalServerErrorException('Failed to update property request');
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(PropertyRequest, {
        where: { id },
        relations: ['photos'],
      });

      if (!request) throw new NotFoundException('Property request not found');

      if (request.photos?.length) {
        await Promise.all(
          request.photos.map((photo) =>
            this.cloudinaryService.deleteImage(photo.public_id),
          ),
        );
      }

      await queryRunner.manager.delete(PropertyRequestPhoto, {
        propertyRequest: { id },
      });

      await queryRunner.manager.delete(PropertyRequest, { id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to delete property request',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updatePropertyRequestByAdmin(
    id: string,
    dto: UpdatePropertyRequestByAdminDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log('dto', dto);

    try {
      const property = await queryRunner.manager.findOne(Property, {
        where: {
          propertyNumber: dto.propertyNumber,
        },
        order: { createdAt: 'DESC' },
        relations: ['office', 'office.user', 'reservation', 'reservation.user'],
      });

      if (!property) throw new NotFoundException('Property not found');

      const { reservation } = property;
      console.log("this is the property : ",property);
      // console.log("this is the property : ",property);
      

      const { user } = reservation;

      const propertyRequest = await queryRunner.manager.findOne(
        PropertyRequest,
        {
          where: { id },
          relations: ['record', 'record.archive'],
        },
      );

      console.log('property request propertyRequest:', propertyRequest);

      if (!propertyRequest)
        throw new NotFoundException('Property request not found');

      const { record } = propertyRequest;

      const propertyStats = await queryRunner.manager.findOne(
        PropertyStatistics,
        {
          where: {
            property,
          },
          order: {
            createdAt: 'DESC',
          },
        },
      );

      if (!propertyStats)
        throw new NotFoundException('propertyStats not found');

      if (dto.status === EnumPropertyRequestStatus.Rejected) {
        propertyRequest.status = EnumPropertyRequestStatus.Rejected;
        await queryRunner.manager.save(propertyRequest);

        await this.notificationService.notifyUser(
          queryRunner,
          property.office.user.id,
          'Your property request has been rejected due to illegal information.',
          'Property Request Rejection',
        );

        const records = await this.recordRepo.find();

        if (records == null || records.length == 1) {
          this.archiveRepo.delete(propertyRequest.record.archive.id);
        }

        this.recordRepo.delete(propertyRequest.record.id);
      } else if (
        dto.status === EnumPropertyRequestStatus.Accepted &&
        property.typeOperation == PropertyTypeOperation.Renting
      ) {
        await this.createRentalExpirationDate(queryRunner, {
          propertyNumber: property.propertyNumber,
          expireDate: record.rental_End_Date!,
        });

        propertyRequest.status = EnumPropertyRequestStatus.Accepted;

        propertyStats.operationType = OperationTypeStatistics.renting;

        await this.propertyService.removePropertySoft(queryRunner, property.id);
        await queryRunner.manager.save(propertyRequest);
        await queryRunner.manager.save(propertyStats);

        await this.notificationService.notifyUser(
          queryRunner,
          property.office.user.id,
          'Your property request has been accepted.',
          'Property Request Acceptance',
        );

        const archive = await this.archiveRepo.findOne({
          where: { id: propertyRequest.record.archive.id },
        });

        if (archive && archive.status == ArchiveStatus.PENDING) {
          archive.status = ArchiveStatus.ACCEPETED;

          await this.archiveRepo.save(archive);
        }
        // property.status = EnumStatus.Rented;

        await this.propertyService.removePropertySoft(queryRunner, property.id);

        // this.propertyRepo.save(property);

        record.status = ArchiveStatus.ACCEPETED;

        this.recordRepo.save(record);

        if (reservation && user) {
          this.reservationRepo.delete(reservation.id);

          const userProperty = await this.userPropertyRepo.create({
            type: property.typeOperation,
            user: user,
            property: property,
          });

          this.userPropertyRepo.save(userProperty);
        }
      } else {
        propertyRequest.status = EnumPropertyRequestStatus.Accepted;

        propertyStats.operationType = OperationTypeStatistics.selling;

        await queryRunner.manager.save(propertyRequest);
        await queryRunner.manager.save(propertyStats);

        await this.propertyService.removePropertySoft(queryRunner, property.id);

        await this.notificationService.notifyUser(
          queryRunner,
          property.office.user.id,
          'Your property request has been accepted.',
          'Property Request Acceptance',
        );

        const archive = await this.archiveRepo.findOne({
          where: { id: propertyRequest.record.archive.id },
        });

        if (archive && archive.status == ArchiveStatus.PENDING) {
          archive.status = ArchiveStatus.ACCEPETED;

          await this.archiveRepo.save(archive);
        }

        property.status = EnumStatus.Sold;

        this.propertyRepo.save(property);

        record.status = ArchiveStatus.ACCEPETED;

        this.recordRepo.save(record);

        if (reservation && user) {
          this.reservationRepo.delete(reservation.id);

          const userProperty = await this.userPropertyRepo.create({
            type: property.typeOperation,
            user: user,
            property: property,
          });

          this.userPropertyRepo.save(userProperty);
        }
      }
      console.log('propertyRequest');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to update property request',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createRentalExpirationDate(
    queryRunner: QueryRunner,
    dto: CreateRentalExpirationDateDto,
  ) {
    const property = await queryRunner.manager.findOne(Property, {
      where: {
        propertyNumber: dto.propertyNumber,
        typeOperation: PropertyTypeOperation.Renting,
      },
      relations: ['office', 'office.user'],
    });

    if (!property) throw new NotFoundException('Property not found');

    const rentalExpiration = queryRunner.manager.create(RentalExpirationDate, {
      property,
      expireDate: dto.expireDate,
    });

    // property.status = EnumStatus.Rented;

    // await queryRunner.manager.save(property);
    await queryRunner.manager.save(rentalExpiration);

    await this.propertyService.updatePropertyStatus(property.id, {
      status: EnumStatus.Rented,
    });

    await this.notificationService.notifyUser(
      queryRunner,
      property.office.user.id,
      'Your rental property request has been accepted.',
      'Rental Property',
    );
  }
}

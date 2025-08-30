import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Location } from './entities/location.entity';
import { PropertyAttribute } from './entities/property_attribute.entity';
import { PropertyPhotos } from './entities/property_photos.entity';
import { LicenseDetails } from './entities/license_details.entity';
import { Office } from 'src/office/entities/office.entity';
import { OfficeService } from 'src/office/office.service';
import { UserAuthService } from 'src/user/services/user-auth.service';
import { LicenseType } from '../license-type/entities/license_type.entity';
import { PropertyResponse } from './common/property-response.interface';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { Attribute } from 'src/attribute/entities/attribute.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { EnumStatus } from './common/property-status.enum';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto';
import { PaginationDto } from '../common/utils/pagination.dto';
import { PaginatedResponse } from '../common/utils/paginated-response.interface';
import { CreateAttributeDto } from './dto/attribute/create-attribute.dto';
import { SearchPaymentCardDto } from 'src/payment-card/dto/create-payment-card.dto';
import { PaymentCardService } from 'src/payment-card/payment-card.service';
import { NotificationService } from 'src/notification/notification.service';
import {
  OperationTypeStatistics,
  PropertyStatistics,
} from 'src/statistics/entities/property-statistics.entity';
import { PropertyTypeOperation } from './common/property-type-operation.enum';
import { GeneralStatisticsService } from 'src/statistics/services/general-statistics.service';
import { PropertyStatisticsService } from 'src/statistics/services/property-statistics.service';

@Injectable()
export class PropertyService {
  constructor(
    // @InjectRepository(Office)
    // private readonly officeRepository: Repository<Office>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(PropertyType)
    private readonly propertyTypeRepository: Repository<PropertyType>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(PropertyAttribute)
    private readonly propertyAttributeRepository: Repository<PropertyAttribute>,
    @InjectRepository(PropertyPhotos)
    private readonly photoRepository: Repository<PropertyPhotos>,
    @InjectRepository(LicenseDetails)
    private readonly licenseDetailsRepository: Repository<LicenseDetails>,
    @InjectRepository(LicenseType)
    private readonly licenseTypeRepository: Repository<LicenseType>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly officeService: OfficeService,
    private readonly userService: UserAuthService,
    private readonly paymentCardService: PaymentCardService,
    private readonly notificationService: NotificationService,
    private readonly generalStatisticsService: GeneralStatisticsService,
    private readonly propertyStatisticsService: PropertyStatisticsService,
    private readonly dataSource: DataSource,
  ) { }

  async create(
    officeManagerId: string,
    createPropertyDto: CreatePropertyDto,
    property_photos: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await this.officeService.getCurrentUserOffice(
        officeManagerId,
        true,
      );
      if (!office) {
        throw new ForbiddenException('Office not found or access denied');
      }

      // const owner = await this.userService.getUser(createPropertyDto.ownerId);
      // if (!owner) {
      //   throw new BadRequestException('Owner not found');
      // }

      if (
        office.officeSubscription?.remaining_properties! < 0 ||
        office.properties.length > 5
      ) {
        throw new BadRequestException(
          'You have reached the limit of adding properties, if you wanna add more you can subcripe in the app to increase the number of properties these you can add.',
        );
      }

      const propertyType = await queryRunner.manager.findOne(PropertyType, {
        where: { id: createPropertyDto.propertyType },
      });
      if (!propertyType) throw new NotFoundException('PropertyType not found');

      const licenseType = await queryRunner.manager.findOne(LicenseType, {
        where: { id: createPropertyDto.licenseType },
      });
      if (!licenseType) throw new NotFoundException('LicenseType not found');

      // Save license details
      const license_details = queryRunner.manager.create(LicenseDetails, {
        licenseNumber: createPropertyDto.licenseNumber,
        date: new Date(),
        license: licenseType,
      });
      await queryRunner.manager.save(license_details);

      // Save location
      const location = this.locationRepository.create(
        createPropertyDto.location,
      );
      await queryRunner.manager.save(location);

      // Create and save property

      const existingProperties = await this.propertyRepository.find({
        where: { propertyNumber: createPropertyDto.propertyNumber }
      });
      for (var i = 0; i < existingProperties.length; i++) {
        if (existingProperties[i].softDelete === false) {
          return { message: 'A Property with this Property Number is Already Published and in the app' }
        }
      }
      const property = this.propertyRepository.create({
        ...createPropertyDto,
        location,
        office,
        type: propertyType,
        publishDate: new Date(),
        softDelete: false,
        licenseDetails: license_details,
        propertyAttributes: [],
        photos: [],
      });
      await queryRunner.manager.save(property); // Must save before setting relations
      // Save attributes
      const propertyAttributes: PropertyAttribute[] = [];
      for (const attrDto of createPropertyDto.attributes) {
        let attribute = await queryRunner.manager.findOne(Attribute, {
          where: { name: attrDto.name },
        });
        console.log(attribute);
        if (!attribute) {
          attribute = this.attributeRepository.create({ name: attrDto.name });
          await queryRunner.manager.save(attribute);
        }

        const propertyAttribute = this.propertyAttributeRepository.create({
          property,
          attribute,
          value: attrDto.value,
        });
        await queryRunner.manager.save(propertyAttribute);
        propertyAttributes.push(propertyAttribute);
      }
      property.propertyAttributes = propertyAttributes;

      // Upload and save photos
      const photos: PropertyPhotos[] = [];
      for (const file of property_photos) {
        const uploadRes = await this.cloudinaryService.uploadImage(file);
        const photo = this.photoRepository.create({
          property,
          url: uploadRes.secure_url,
          public_id: uploadRes.public_id,
        });
        await queryRunner.manager.save(photo);
        photos.push(photo);
      }
      property.photos = photos;
      // Final save to update relations (optional if not using eager)
      await queryRunner.manager.save(property);

      await queryRunner.commitTransaction();

      return {
        message: 'We will review your property creation request shortly.',
      };
    } catch (error) {
      console.log('this is the error : ', error);

      await queryRunner.rollbackTransaction();
      throw error;
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  // async update(id: string,officeManagerId:string, updateDto: UpdatePropertyDto) {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {

  //     const existing = await queryRunner.manager.findOne(Property, {
  //       where: { id },
  //       relations: ['location', 'type'],
  //     });

  //     if (!existing) throw new NotFoundException('Property not found');

  //    if(existing.office.user.id != officeManagerId){
  //     throw new ForbiddenException("You can't do this!")
  //    }

  //     if (updateDto.location) {
  //       Object.assign(existing.location, updateDto.location);
  //       await queryRunner.manager.save(existing.location);
  //     }

  //     if (updateDto.propertyType) {
  //       const type = await queryRunner.manager.findOne(PropertyType, {
  //         where: { id: updateDto.propertyType },
  //       });
  //       if (!type) throw new NotFoundException('PropertyType not found');
  //       existing.type = type;
  //     }

  //     Object.assign(existing, updateDto);
  //     const updated = await queryRunner.manager.save(existing);

  //     await queryRunner.commitTransaction();
  //     return updated;
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     throw new InternalServerErrorException(err.message);
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async update(
    id: string,
    officeManagerId: string,
    updateDto: UpdatePropertyDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Property, {
        where: { id },
        // relations: ['office', 'office.user', 'type', 'propertyAttributes', 'location', 'propertyAttributes.attribute'],
        relations: ['office', 'office.user', 'type'],
      });

      if (!existing) throw new NotFoundException('Property not found');

      if (existing.office.user.id !== officeManagerId) {
        throw new ForbiddenException("You can't update this property");
      }

      // // ✅ Update attributes
      // if (updateDto.attributes) {
      //   // Delete old propertyAttributes
      //   await queryRunner.manager.delete(PropertyAttribute, { property: { id: existing.id } });

      //   const newAttributes: PropertyAttribute[] = [];
      //   for (const attrDto of updateDto.attributes) {
      //     let attribute = await queryRunner.manager.findOne(Attribute, {
      //       where: { name: attrDto.name },
      //     });

      //     if (!attribute) {
      //       attribute = this.attributeRepository.create({ name: attrDto.name });
      //       await queryRunner.manager.save(attribute);
      //     }

      //     const propertyAttribute = this.propertyAttributeRepository.create({
      //       property: existing,
      //       attribute,
      //       value: attrDto.value,
      //     });

      //     await queryRunner.manager.save(propertyAttribute);
      //     newAttributes.push(propertyAttribute);
      //   }

      //   existing.propertyAttributes = newAttributes;
      // }

      // ✅ Update other simple fields (space, price, description, etc.)
      const updatableFields = ['price', 'description'];
      for (const field of updatableFields) {
        if (updateDto[field] !== undefined) {
          existing[field] = updateDto[field];
        }
      }

      const updated: PropertyResponse =
        await queryRunner.manager.save(existing);
      await queryRunner.commitTransaction();

      return updated;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async addNewPhotoToPropertyPhotos(
    propertyId: string,
    property_photo: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const property = await queryRunner.manager.findOne(Property, {
        where: {
          id: propertyId,
        },
      });

      if (!property) {
        throw new NotFoundException(`property not found`);
      }

      const uploadRes =
        await this.cloudinaryService.uploadImage(property_photo);
      const photo = this.photoRepository.create({
        property,
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
      });

      await queryRunner.manager.save(photo);

      await queryRunner.commitTransaction();
      return photo;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removePhotoOfPropertyFromPropertyPhotos(propertyPhotoId: string) {
    console.log('this is the propertyPhotoId : ', propertyPhotoId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const photo = await queryRunner.manager.findOne(PropertyPhotos, {
        where: {
          id: propertyPhotoId,
        },
      });

      if (!photo) {
        throw new NotFoundException(`Property photo not found`);
      }

      const deletedPhotoId = photo.id; // Store the ID before removal

      await this.cloudinaryService.deleteImage(photo.public_id);
      await queryRunner.manager.remove(photo);
      await queryRunner.commitTransaction();

      return { deletedPhotoId }; // Return the stored ID
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addNewAttributeToPropertyAttributes(
    createAttributeDto: CreateAttributeDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const property = await queryRunner.manager.findOne(Property, {
        where: {
          id: createAttributeDto.propertyId,
        },
      });

      if (!property) {
        throw new NotFoundException(`property not found`);
      }

      // Save attributes
      let attribute = await queryRunner.manager.findOne(Attribute, {
        where: { name: createAttributeDto.name },
      });

      if (!attribute) {
        throw new NotFoundException(`attribute not found`);
      }

      let propertyAttribute = await queryRunner.manager.findOne(
        PropertyAttribute,
        {
          where: { property, attribute },
        },
      );

      if (!propertyAttribute) {
        propertyAttribute = queryRunner.manager.create(PropertyAttribute, {
          property,
          attribute,
          value: createAttributeDto.value,
        });
      } else {
        propertyAttribute.value = createAttributeDto.value;
        propertyAttribute.property = property;
        propertyAttribute.attribute = attribute;
      }

      await queryRunner.manager.save(propertyAttribute);

      await queryRunner.commitTransaction();

      return propertyAttribute;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeAttributeOfPropertyFromPropertyAttributes(
    propertyAttributeId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const attribute = await queryRunner.manager.findOne(PropertyAttribute, {
        where: {
          id: propertyAttributeId,
        },
      });

      if (!attribute) {
        throw new NotFoundException(`attribute not found`);
      }
      const deletedAttributeId = attribute.id; // Store the ID before removal

      await queryRunner.manager.remove(attribute);
      await queryRunner.commitTransaction();

      return { deletedAttributeId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // async findAll() {
  //   return this.propertyRepository.find({
  //     relations: [
  //       'photos',
  //       'location',
  //       'type',
  //       'licenseDetails',
  //       'propertyAttributes',
  //       'propertyAttributes.attribute',
  //     ],
  //   });
  // }

  /**
   * Retrieves all properties that are currently in 'accepted' status.
   * Includes related entities for detailed display.
   * @returns A promise that resolves to an array of Property entities.
   */
  async findAllAcceptedProperties(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Property>> {
    // Renamed for clarity

    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.propertyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        status: EnumStatus.Accepted, // <-- Add this line to filter by status
        softDelete: false, // <-- Assuming you also want to exclude soft-deleted properties
      },
      relations: [
        'photos',
        'location',
        'type',
        // ----> from this
        'office',
        'office.office_photo',
        // ---> to this is omar
        'licenseDetails',
        'licenseDetails.license', // Include nested relation for license name
        'propertyAttributes',
        'propertyAttributes.attribute', // Include nested relation for attribute name
      ],
      order: {
        publishDate: 'DESC', // Typically, newer accepted properties are shown first
      },
    });


    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findAllReservedPropertiesForUser(
    userId: string,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.propertyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        reservation: { user: { id: userId } },
        status: EnumStatus.Reserved, // <-- Add this line to filter by status
        softDelete: false, // <-- Assuming you also want to exclude soft-deleted properties
        // owner: {
        //   id: userId
        // }
      },
      relations: [
        'reservation',
        'photos',
        'location',
        'type',
        'licenseDetails',
        'licenseDetails.license', // Include nested relation for license name
        'propertyAttributes',
        'propertyAttributes.attribute', // Include nested relation for attribute name
        'office',
      ],
      order: {
        publishDate: 'DESC', // Typically, newer accepted properties are shown first
      },
    });

    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves all properties that are currently in 'pending' status.
   * Includes related entities like photos, location, type, licenseDetails,
   * propertyAttributes, and owner for detailed display.
   * @returns A promise that resolves to an array of Property entities.
   */
  async getAllPropertiesWhoAreStillNotAccepted(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Property>> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.propertyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        status: EnumStatus.Pending, // Filter by pending status
        softDelete: false, // Ensure it's not soft-deleted
      },
      relations: [
        'photos', // Load property photos
        'location', // Load location details
        'type', // Load property type (e.g., "Office", "Apartment")
        'licenseDetails', // Load license details
        'licenseDetails.license', // Load the actual license type within licenseDetails
        'propertyAttributes', // Load custom attributes (e.g., "Rooms", "Bathrooms")
        'propertyAttributes.attribute', // Load attribute names
      ],
      order: {
        publishDate: 'ASC', // Order by oldest first for review queue
      },
    });

    if (!data || data.length === 0) {
      // You can throw a NotFoundException or simply return an empty array
      // Depending on whether you consider "no pending properties" an error or a normal state.
      // For an admin dashboard, returning an empty array is usually fine.
      return {
        data: [],
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      };
    }

    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }
  /**
   * Updates the status of a specific property.
   * @param id The ID of the property to update.
   * @param status The new status (e.g., 'accepted', 'rejected').
   * @returns A promise that resolves to the updated Property entity.
   */
  async updatePropertyStatus(
    id: string,
    updatePropertyStatusDto: UpdatePropertyStatusDto,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // 1. Find the property first
      const property = await queryRunner.manager.findOne(Property, {
        where: { id },
        relations: ['office', 'office.user'],
      });

      if (!property) {
        throw new NotFoundException(`Property with ID "${id}" not found.`);
      }

      if (property.status === EnumStatus.Accepted) {
        const propertyStatistics = await queryRunner.manager.findOne(
          PropertyStatistics,
          {
            where: {
              property,
            },
            order: {
              createdAt: 'ASC', // "ASC" stands for ascending, which gets the earliest date.
            },
          },
        );
        if (propertyStatistics) {
          propertyStatistics.operationType =
            property.typeOperation === PropertyTypeOperation.Selling
              ? OperationTypeStatistics.selling
              : OperationTypeStatistics.renting;
          await queryRunner.manager.save(propertyStatistics);
        }
      }

      // 2. Update its status
      property.status = updatePropertyStatusDto.status;

      // 3. Save the updated property
      const updatedProperty = await queryRunner.manager.save(property);

      // 4. Return the updated property (which already has the relations if needed by the controller)
      // If you need all relations for the response, you can re-fetch or use save's return value carefully.
      // The `save` method often returns the entity with its current state, but might not re-load all relations automatically.
      // To ensure all relations are loaded for the response, the previous `findOne` call or a new `findOne` is good.
      // Let's re-fetch with relations to be absolutely sure the returned object is complete for the client.

      const message =
        property.status === EnumStatus.Accepted
          ? `We have accepeted you request for adding new Property with This Property Number ${property.propertyNumber}`
          : `We have rejected you request for adding new Property with This Property Number ${property.propertyNumber} because it doesn't verfiy all requiremnts.`;
      await this.notificationService.notifyUser(
        queryRunner,
        updatedProperty.office.user.id,
        message,
        'Property Adding Status.',
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removePropertySoft(queryRunner: QueryRunner, id: string) {
    // 1. Find the property first
    const property = await queryRunner.manager.findOne(Property, {
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found.`);
    }

    // 2. Update its softDelete
    property.softDelete = true;

    // 3. Save the updated property
    await queryRunner.manager.save(property);
  }

  async findOneByPropertyNumber(propertyNumber: string) {
    const property = await this.propertyRepository.findOne({
      where: { propertyNumber, status: EnumStatus.Accepted },
      relations: [
        'photos',
        'location',
        'type',
        'licenseDetails',
        'propertyAttributes',
        'propertyAttributes.attribute',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  // async findPropertiesByFiltering(
  //   filterDto: FilterPropertyDto,
  //   paginationDto: PaginationDto,
  //   userId?: string
  // ) {
  //   const { page = 1, limit = 10 } = paginationDto;

  //   const query = this.propertyRepository.createQueryBuilder('property')
  //     .leftJoinAndSelect('property.photos', 'photos')
  //     .leftJoinAndSelect('property.location', 'location')
  //     .leftJoinAndSelect('property.type', 'type')
  //     .leftJoinAndSelect('property.licenseDetails', 'licenseDetails')
  //     .leftJoinAndSelect('licenseDetails.license', 'license')
  //     .leftJoinAndSelect('property.propertyAttributes', 'propertyAttributes')
  //     .leftJoinAndSelect('propertyAttributes.attribute', 'attribute')
  //     .leftJoin("property.office", "office")
  //     .leftJoin("office.user", "user")
  //     .where('property.softDelete = :softDelete', { softDelete: false })
  //     // .andWhere('user.id != :userId', { userId })
  //     .andWhere('property.status = :status', { status: EnumStatus.Accepted });

  //   const {
  //     type,
  //     purpose,
  //     price,
  //     space,
  //     licenseType,
  //     attributeFilters,
  //     location,
  //   } = filterDto;

  //   console.log("this is the type : ",filterDto);

  //   // Type
  //   if (type) {
  //     query.andWhere('type.name = :type', { type });
  //   }

  //   // Purpose (Selling or Renting via typeOperation column)
  //   if (purpose?.selling && !purpose?.renting) {
  //     query.andWhere('property.typeOperation = :typeOp', { typeOp: 'selling' });
  //   } else if (!purpose?.selling && purpose?.renting) {
  //     query.andWhere('property.typeOperation = :typeOp', { typeOp: 'renting' });
  //   }
  //   // If both are selected, show both (do nothing — already default)

  //   // // Purpose (selling / renting)
  //   // if (purpose?.selling && !purpose?.renting) {
  //   //   query.andWhere('property.typeOperation = :typeOp', { typeOp: 'selling' });
  //   // } else if (!purpose?.selling && purpose?.renting) {
  //   //   query.andWhere('property.typeOperation = :typeOp', { typeOp: 'renting' });
  //   // } else if (purpose?.selling && purpose?.renting) {
  //   //   // Show both: selling OR renting
  //   //   query.andWhere('(property.typeOperation = :selling OR property.typeOperation = :renting)', {
  //   //     selling: 'selling',
  //   //     renting: 'renting',
  //   //   });
  //   // }

  //   // Price range
  //   if (price?.length === 2) {
  //     query.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
  //       minPrice: price[0],
  //       maxPrice: price[1],
  //     });
  //   }

  //   // Space range
  //   if (space?.length === 2) {
  //     query.andWhere('property.space BETWEEN :minSpace AND :maxSpace', {
  //       minSpace: space[0],
  //       maxSpace: space[1],
  //     });
  //   }

  //   // License Type
  //   if (licenseType) {
  //     query.andWhere('license.name = :licenseType', {
  //       licenseType,
  //     });
  //   }

  //   // Location filters
  //   if (location?.governorate) {
  //     query.andWhere('location.governorate = :governorate', {
  //       governorate: location.governorate,
  //     });
  //   }
  //   if (location?.province) {
  //     query.andWhere('location.province = :province', {
  //       province: location.province,
  //     });
  //   }
  //   if (location?.city) {
  //     query.andWhere('location.city = :city', {
  //       city: location.city,
  //     });
  //   }
  //   if (location?.street) {
  //     query.andWhere('location.street = :street', {
  //       street: location.street,
  //     });
  //   }

  //   // Dynamic attribute filters
  //   if (attributeFilters?.length! > 0) {
  //     attributeFilters?.forEach((attr, index) => {
  //       const attrNameKey = `attrName${index}`;
  //       const attrValueKey = `attrValue${index}`;
  //       query.andWhere(
  //         `(attribute.name = :${attrNameKey} AND propertyAttributes.value = :${attrValueKey})`,
  //         {
  //           [attrNameKey]: attr.attribute,
  //           [attrValueKey]: attr.value,
  //         },
  //       );
  //     });
  //   }

  //   // ✅ Apply pagination
  //   query.skip((page - 1) * limit).take(limit);

  //   // ✅ Execute query with total count
  //   const [data, total] = await query.getManyAndCount();

  //   console.log('this is the data', data);
  //   console.log('this is the total',total);

  //   return {
  //     data,
  //     total,
  //     page,
  //     limit,
  //     pageCount: Math.ceil(total / limit),
  //   };

  // }

  async findPropertiesByFiltering(
    filterDto: FilterPropertyDto,
    paginationDto: PaginationDto,
    //userId?: string
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    console.log('this is the filterDto', filterDto);

    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.photos', 'photos')
      .leftJoinAndSelect('property.location', 'location')
      .leftJoinAndSelect('property.type', 'type')
      .leftJoinAndSelect('property.licenseDetails', 'licenseDetails')
      .leftJoinAndSelect('licenseDetails.license', 'license')
      .leftJoinAndSelect('property.propertyAttributes', 'propertyAttributes')
      .leftJoinAndSelect('propertyAttributes.attribute', 'attribute')
      .leftJoinAndSelect('property.office', 'office')
      .leftJoinAndSelect('office.office_photo', 'office_photo')

      .leftJoin('office.user', 'user')
      .where('property.softDelete = :softDelete', { softDelete: false })
      //.andWhere('user.id != :userId', { userId }) // Uncomment if needed
      .andWhere('property.status = :status', { status: EnumStatus.Accepted });

    const {
      type,
      typeOfPropertyType,
      purpose,
      price,
      space,
      licenseType,
      attributeFilters,
      location,
    } = filterDto;

    console.log('this is the type : ', filterDto);

    if (typeOfPropertyType) {
      query.andWhere('type.type = :typeOfPropertyType', { typeOfPropertyType });
    }

    // Type filter
    if (type && type !== '') {
      query.andWhere('type.name = :type', { type });
    }

    // Purpose filter
    if (purpose?.selling && !purpose?.renting) {
      query.andWhere('property.typeOperation = :typeOp', { typeOp: 'selling' });
    } else if (!purpose?.selling && purpose?.renting) {
      query.andWhere('property.typeOperation = :typeOp', { typeOp: 'renting' });
    }

    // Price range filter
    if (price?.length === 2) {
      query.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: price[0],
        maxPrice: price[1],
      });
    }

    // Space range filter
    if (space?.length === 2) {
      query.andWhere('property.space BETWEEN :minSpace AND :maxSpace', {
        minSpace: space[0],
        maxSpace: space[1],
      });
    }

    // License Type filter
    if (licenseType && licenseType !== '') {
      query.andWhere('license.name = :licenseType', {
        licenseType,
      });
    }

    // Location filters
    if (location?.governorate && location?.governorate !== '') {
      query.andWhere('location.governorate = :governorate', {
        governorate: location.governorate,
      });
    }
    if (location?.province && location?.province !== '') {
      query.andWhere('location.province = :province', {
        province: location.province,
      });
    }
    if (location?.city && location?.city !== '') {
      query.andWhere('location.city = :city', {
        city: location.city,
      });
    }
    if (location?.street && location?.street !== '') {
      query.andWhere('location.street = :street', {
        street: location.street,
      });
    }

    // Dynamic attribute filters (The fix is here)
    if (attributeFilters && attributeFilters.length > 0) {
      const attributeSubQuery = this.propertyRepository
        .createQueryBuilder('sub_property')
        .leftJoin('sub_property.propertyAttributes', 'sub_pa')
        .leftJoin('sub_pa.attribute', 'sub_attr')
        .select('sub_property.id')
        .groupBy('sub_property.id')
        .where('1=1');

      attributeFilters?.forEach((attr, index) => {
        const attrNameKey = `attrName${index}`;
        const attrValueKey = `attrValue${index}`;
        attributeSubQuery.andWhere(
          `(sub_attr.name = :${attrNameKey} AND sub_pa.value = :${attrValueKey})`,
          {
            [attrNameKey]: attr.attribute,
            [attrValueKey]: attr.value,
          },
        );
      });

      attributeSubQuery.having('COUNT(sub_property.id) = :count', {
        count: attributeFilters?.length,
      });

      query.andWhere(`property.id IN (${attributeSubQuery.getQuery()})`);
      query.setParameters(attributeSubQuery.getParameters());
    }

    // Apply pagination
    query.skip((page - 1) * limit).take(limit);

    // Execute query with total count
    const [data, total] = await query.getManyAndCount();

    console.log('this is the data', data);
    console.log('this is the total', total);

    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const property = await this.propertyRepository.findOne({
      where: { id, status: EnumStatus.Accepted },
      relations: [
        'photos',
        'location',
        'type',
        'licenseDetails',
        'propertyAttributes',
        'propertyAttributes.attribute',
      ],
    });
    console.log('this is the property', property);

    if (!property) throw new NotFoundException('Property not found');

    return property;
  }

  async findByOfficeId(officeId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.propertyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        office: {
          id: officeId,
        },
        status: In([EnumStatus.Accepted, EnumStatus.Reserved]),
      },
      relations: [
        'photos',
        'location',
        'type',
        'licenseDetails',
        'propertyAttributes',
        'propertyAttributes.attribute',
      ],
    });
    if (!data) throw new NotFoundException('Property not found');
    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async payBeforeRemove(
    id: string,
    searchPaymentCardDto: SearchPaymentCardDto,
    userId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const amountIsPayed = 50;

    try {
      const property = await queryRunner.manager.findOne(Property, {
        where: {
          id,
          office: {
            user: {
              id: userId,
            },
          },
        },
        relations: [
          'photos',
          'propertyAttributes',
          'licenseDetails',
          'location',
        ],
      });
      if (!property) throw new NotFoundException('Property not found');

      await this.paymentCardService.searchAndWithdraw(
        searchPaymentCardDto,
        amountIsPayed,
        queryRunner.manager,
      );

      await this.generalStatisticsService.createGeneralStats(
        queryRunner,
        amountIsPayed,
      );
      await this.propertyStatisticsService.createPropertyStats(
        queryRunner,
        amountIsPayed,
        OperationTypeStatistics.deleting,
        property,
      );

      // Delete photos from Cloudinary
      for (const photo of property.photos) {
        await this.cloudinaryService.deleteImage(photo.public_id);
        await queryRunner.manager.remove(photo);
      }

      // Remove property attributes
      for (const attr of property.propertyAttributes) {
        await queryRunner.manager.remove(attr);
      }

      // Remove licenseDetails

      // Remove property
      await queryRunner.manager.remove(property);

      if (property.licenseDetails) {
        await queryRunner.manager.remove(property.licenseDetails);
      }

      // Remove location
      await queryRunner.manager.remove(property.location);

      await queryRunner.commitTransaction();

      return property.id;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const property = await queryRunner.manager.findOne(Property, {
        where: { id },
        relations: [
          'photos',
          'propertyAttributes',
          'licenseDetails',
          'location',
        ],
      });
      if (!property) throw new NotFoundException('Property not found');

      // Delete photos from Cloudinary
      for (const photo of property.photos) {
        await this.cloudinaryService.deleteImage(photo.public_id);
        await queryRunner.manager.remove(photo);
      }

      // Remove property attributes
      for (const attr of property.propertyAttributes) {
        await queryRunner.manager.remove(attr);
      }

      // Remove licenseDetails

      // Remove property
      await queryRunner.manager.remove(property);

      if (property.licenseDetails) {
        await queryRunner.manager.remove(property.licenseDetails);
      }

      // Remove location
      await queryRunner.manager.remove(property.location);

      await queryRunner.commitTransaction();

      return property;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}

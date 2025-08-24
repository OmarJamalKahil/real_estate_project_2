import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

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
        where: { id: createPropertyDto.propertyTypeId },
      });
      if (!propertyType) throw new NotFoundException('PropertyType not found');

      const licenseType = await queryRunner.manager.findOne(LicenseType, {
        where: { name: createPropertyDto.licenseType },
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
      const property = this.propertyRepository.create({
        ...createPropertyDto,
        location,
        office,
        propertyType: propertyType,
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
          where: { id: attrDto.attributeId },
        });

        if (!attribute) {
          // attribute = this.attributeRepository.create({ name: attrDto.name });
          // await queryRunner.manager.save(attribute);
          return null;
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
        relations: [
          'office',
          'office.user',
          'propertyType',
          'propertyAttributes',
          'location',
          'propertyAttributes.attribute',
        ],
      });

      if (!existing) throw new NotFoundException('Property not found');

      if (existing.office.user.id !== officeManagerId) {
        throw new ForbiddenException("You can't update this property");
      }

      // ❌ Prevent location update
      if (updateDto.location) {
        throw new BadRequestException('Updating location is not allowed');
      }

      // ✅ Update property type if provided
      if (updateDto.propertyTypeId) {
        const type = await queryRunner.manager.findOne(PropertyType, {
          where: { id: updateDto.propertyTypeId },
        });
        if (!type) throw new NotFoundException('PropertyType not found');
        existing.propertyType = type;
      }

      // ✅ Update attributes
      if (updateDto.attributes) {
        // Delete old propertyAttributes
        await queryRunner.manager.delete(PropertyAttribute, {
          property: { id: existing.id },
        });

        const newAttributes: PropertyAttribute[] = [];
        for (const attrDto of updateDto.attributes) {
          let attribute = await queryRunner.manager.findOne(Attribute, {
            where: { id: attrDto.attributeId },
          });

          if (!attribute) {
            // attribute = this.attributeRepository.create({ name: attrDto.name });
            // await queryRunner.manager.save(attribute);
            return null;
          }

          const propertyAttribute = this.propertyAttributeRepository.create({
            property: existing,
            attribute,
            value: attrDto.value,
          });

          await queryRunner.manager.save(propertyAttribute);
          newAttributes.push(propertyAttribute);
        }

        existing.propertyAttributes = newAttributes;
      }

      // ✅ Update other simple fields (space, price, description, etc.)
      const updatableFields = [
        'propertyNumber',
        'space',
        'price',
        'description',
      ];
      for (const field of updatableFields) {
        if (updateDto[field] !== undefined) {
          existing[field] = updateDto[field];
        }
      }

      const updated: PropertyResponse =
        await queryRunner.manager.save(existing);
      await queryRunner.commitTransaction();

      return {
        message: 'We will review your property update request shortly.',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
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
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.office', 'office')
      .leftJoinAndSelect('property.photos', 'photos')
      .leftJoinAndSelect('property.location', 'location')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.licenseDetails', 'licenseDetails')
      .leftJoinAndSelect('licenseDetails.license', 'license')
      .leftJoinAndSelect('property.propertyAttributes', 'propertyAttributes')
      .leftJoinAndSelect('propertyAttributes.attribute', 'attribute')
      .where('property.status = :status', { status: EnumStatus.Accepted })
      .andWhere('property.softDelete = :softDelete', { softDelete: false })
      .orderBy('property.publishDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .select([
        'property', // يجيب كل أعمدة الـ property
        'office.id', // فقط id من الـ office
        'office.office_photo',
        'office.name',
        'office.office_email',
        'photos',
        'location',
        'propertyType',
        'licenseDetails',
        'license',
        'propertyAttributes',
        'attribute',
      ])
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  // async findAllReservedPropertiesForUser(
  //   userId: string,
  //   paginationDto: PaginationDto,
  // ) {
  //   const { page = 1, limit = 10 } = paginationDto;
  //   const [data, total] = await this.propertyRepository.findAndCount({
  //     skip: (page - 1) * limit,
  //     take: limit,
  //     where: {
  //       status: EnumStatus.Reserved, // <-- Add this line to filter by status
  //       softDelete: false, // <-- Assuming you also want to exclude soft-deleted properties
  //       // owner: {
  //       //   id: userId
  //       // }
  //     },
  //     relations: [
  //       'photos',
  //       'location',
  //       'propertyType',
  //       'licenseDetails',
  //       'licenseDetails.license', // Include nested relation for license name
  //       'propertyAttributes',
  //       'propertyAttributes.attribute', // Include nested relation for attribute name
  //       'office',
  //     ],
  //     order: {
  //       publishDate: 'DESC', // Typically, newer accepted properties are shown first
  //     },
  //   });

  //   return {
  //     data,
  //     total,
  //     page,
  //     limit,
  //     pageCount: Math.ceil(total / limit),
  //   };
  // }

  async findAllReservedPropertiesForUser(
    userId: string,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.propertyRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where: {
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
        'propertyType',
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
        'propertyType', // Load property type (e.g., "Office", "Apartment")
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
  ): Promise<Property> {
    // 1. Find the property first
    const property = await this.propertyRepository.findOne({ where: { id } });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found.`);
    }

    // 2. Update its status
    property.status = updatePropertyStatusDto.status;

    // 3. Save the updated property
    const updatedProperty = await this.propertyRepository.save(property);

    // 4. Return the updated property (which already has the relations if needed by the controller)
    // If you need all relations for the response, you can re-fetch or use save's return value carefully.
    // The `save` method often returns the entity with its current state, but might not re-load all relations automatically.
    // To ensure all relations are loaded for the response, the previous `findOne` call or a new `findOne` is good.
    // Let's re-fetch with relations to be absolutely sure the returned object is complete for the client.

    const finalProperty = await this.propertyRepository.findOne({
      where: { id: updatedProperty.id }, // Use the ID from the saved property
      relations: [
        'photos',
        'location',
        'propertyType',
        'licenseDetails',
        'licenseDetails.license',
        'propertyAttributes',
        'propertyAttributes.attribute',
      ],
    });

    if (!finalProperty) {
      // This case should ideally not happen if `updatedProperty` was successfully saved
      // but it's good for type safety.
      throw new NotFoundException(
        `Property with ID "${updatedProperty.id}" not found after update.`,
      );
    }

    return finalProperty;
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
        'propertyType',
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
  //     .leftJoinAndSelect('property.propertyType', 'propertyType')
  //     .leftJoinAndSelect('property.licenseDetails', 'licenseDetails')
  //     .leftJoinAndSelect('licenseDetails.license', 'license')
  //     .leftJoinAndSelect('property.propertyAttributes', 'propertyAttributes')
  //     .leftJoinAndSelect('propertyAttributes.attribute', 'attribute')
  //     // Use .where() for the first condition
  //     .where('property.softDelete = :softDelete', { softDelete: false })
  //     // Use .andWhere() for subsequent conditions
  //     .andWhere('property.office.user.id != :id', { id: userId })
  //     .andWhere('property.status = :status', { status: EnumStatus.Accepted });

  //   const {
  //     propertyType,
  //     purpose,
  //     price,
  //     space,
  //     licenseType,
  //     attributeFilters,
  //     location,
  //   } = filterDto;

  //   // Type
  //   if (propertyType) {
  //     query.andWhere('propertyType.name = :propertyType', { propertyType });
  //   }

  //   // Purpose (Selling or Renting via typeOperation column)
  //   if (purpose?.selling && !purpose?.renting) {
  //     query.andWhere('property.typeOperation = :typeOp', { typeOp: 'selling' });
  //   } else if (!purpose?.selling && purpose?.renting) {
  //     query.andWhere('property.typeOperation = :typeOp', { typeOp: 'renting' });
  //   }
  //   // If both are selected, show both (do nothing — already default)

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

  //   return {
  //     data,
  //     total,
  //     page,
  //     limit,
  //     pageCount: Math.ceil(total / limit),
  //   };

  // }

  // omar
  async findPropertiesByFiltering(
    filterDto: FilterPropertyDto,
    paginationDto: PaginationDto,
    //userId?: string
  ) {
    const { page = 1, limit = 10 } = paginationDto;

    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.photos', 'photos')
      .leftJoinAndSelect('property.location', 'location')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .leftJoinAndSelect('property.licenseDetails', 'licenseDetails')
      .leftJoinAndSelect('licenseDetails.license', 'license')
      .leftJoinAndSelect('property.propertyAttributes', 'propertyAttributes')
      .leftJoinAndSelect('propertyAttributes.attribute', 'attribute')
      .leftJoinAndSelect('property.office', 'office')

      // Use .where() for the first condition
      .where('property.softDelete = :softDelete', { softDelete: false })
      // Use .andWhere() for subsequent conditions
      //.andWhere('property.office.user.id != :id', { id: userId })
      .andWhere('property.status = :status', { status: EnumStatus.Accepted });

    const {
      propertyTypeId,
      typeOfPropertyType,
      purpose,
      price,
      space,
      //licenseType,
      attributeFilters,
      location,
    } = filterDto;

    // Type
    if (propertyTypeId) {
      console.log(propertyTypeId)
      query.andWhere('propertyType.id = :propertyTypeId', { propertyTypeId });
    }

    // Purpose (Selling or Renting via typeOperation column)
    if (purpose?.selling && !purpose?.renting) {
      query.andWhere('property.typeOperation = :typeOp', { typeOp: 'selling' });
    } else if (!purpose?.selling && purpose?.renting) {
      query.andWhere('property.typeOperation = :typeOp', { typeOp: 'renting' });
    }
    // If both are selected, show both (do nothing — already default)

    // Price range
    if (price?.length === 2) {
      query.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: price[0],
        maxPrice: price[1],
      });
    }

    // Space range
    if (space?.length === 2) {
      query.andWhere('property.space BETWEEN :minSpace AND :maxSpace', {
        minSpace: space[0],
        maxSpace: space[1],
      });
    }


    // Location filters
    if (location?.governorate) {
      query.andWhere('location.governorate = :governorate', {
        governorate: location.governorate,
      });
    }
    if (location?.province) {
      query.andWhere('location.province = :province', {
        province: location.province,
      });
    }
    if (location?.city) {
      query.andWhere('location.city = :city', {
        city: location.city,
      });
    }
    if (location?.street) {
      query.andWhere('location.street = :street', {
        street: location.street,
      });
    }

    if(typeOfPropertyType){
      query.andWhere('propertyType.type = :typeOfPropertyType' , { typeOfPropertyType});
      console.log("ff");
    }


    // فلترة حسب attributes
    if (attributeFilters?.length! > 0) {
      attributeFilters?.forEach((attr, index) => {
        const attrIdKey = `attrId${index}`;
        const attrValueKey = `attrValue${index}`;

        query.andWhere(
          `EXISTS (
        SELECT 1
        FROM property_attribute pa
        JOIN attribute a ON a.id = pa."attributeId"
        WHERE pa."propertyId" = property.id
          AND a.id = :${attrIdKey}
          AND pa.value = :${attrValueKey}
      )`,
          {
            [attrIdKey]: attr.attributeId,
            [attrValueKey]: attr.value,
          },
        );
      });
    }





    // ✅ Apply pagination
    query.skip((page - 1) * limit).take(limit);

    // ✅ Execute query with total count
    const [data, total] = await query.getManyAndCount();

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
        'propertyType',
        'licenseDetails',
        'propertyAttributes',
        'propertyAttributes.attribute',
      ],
    });

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
        status: EnumStatus.Accepted,
      },
      relations: [
        'photos',
        'location',
        'propertyType',
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

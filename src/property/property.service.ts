// async create(
//   officeManagerId: string,
//   createPropertyDto: CreatePropertyDto,
//   property_photos: Express.Multer.File[],
// ) {
//   const queryRunner = this.dataSource.createQueryRunner();
//   await queryRunner.connect();
//   await queryRunner.startTransaction();

//   try {

//     const office = await this.officeService.getCurrentUserOffice(officeManagerId);

//     if (!office) {
//       throw new ForbiddenException()
//     }

//     const owner = await this.userService.getUser(createPropertyDto.ownerId);

//     if (!owner) {
//       throw new BadRequestException()
//     }
//     // Find propertyType by ID
//     const propertyType = await queryRunner.manager.findOne(PropertyType, {
//       where: { name: createPropertyDto.propertyType },
//     });
//     if (!propertyType) throw new NotFoundException('PropertyType not found');

//     const licenseType = await queryRunner.manager.findOne(LicenseType, {
//       where: { name: createPropertyDto.licenseType },
//     });
//     if (!licenseType) throw new NotFoundException('LicenseType not found');

//     // Save license_details
//     const license_details = this.licenseDetailsRepository.create({
//       licenseNumber: createPropertyDto.licenseNumber,
//       date: new Date(),
//       license: licenseType
//     });
//     await queryRunner.manager.save(license_details);


//     // Save location
//     const location = this.locationRepository.create(createPropertyDto.location);
//     await queryRunner.manager.save(location);


//     // Create base property
//     const property = this.propertyRepository.create({
//       ...createPropertyDto,
//       location,
//       owner,
//       office: office,
//       type: propertyType,
//       publishDate: new Date(),
//       softDelete: false,
//       licenseDetails: license_details,
//       propertyAttributes: [],
//       photos: [],
//     });


//     // await queryRunner.manager.save(Property);

//     const propertyAttributes: PropertyAttribute[] = [];
//     // Save attributes
//     for (const attrDto of createPropertyDto.attributes) {
//       let attribute = await queryRunner.manager.findOne(Attribute, {
//         where: { name: attrDto.name },
//       });

//       if (!attribute) {
//         attribute = this.attributeRepository.create({ name: attrDto.name });
//         await queryRunner.manager.save(attribute);
//       }

//       const propertyAttribute = this.propertyAttributeRepository.create({
//         property: property,
//         attribute,
//         value: attrDto.value,
//       });
//       propertyAttributes.push(propertyAttribute)
//       await queryRunner.manager.save(propertyAttribute);
//     }
//     property.propertyAttributes = propertyAttributes;


//     const photos: PropertyPhotos[] = [];
//     // Upload photos
//     for (const file of property_photos) {
//       const uploadRes = await this.cloudinaryService.uploadImage(file);
//       const photo = this.photoRepository.create({
//         property: property,
//         url: uploadRes.secure_url,
//         public_id: uploadRes.public_id,
//       });
//       photos.push(photo)
//       await queryRunner.manager.save(photo);
//     }
//     property.photos = photos ;

//     await queryRunner.manager.save(property)

//     await queryRunner.commitTransaction();

//     return property;
//   } catch (error) {
//     await queryRunner.rollbackTransaction();
//     throw new InternalServerErrorException(error.message);
//   } finally {
//     await queryRunner.release();
//   }
// }
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
} from 'typeorm';
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
import { LicenseType } from './entities/license_type.entity';
import { PropertyResponse } from './common/property-response.interface';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { Attribute } from 'src/attribute/entities/attribute.entity';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyStatus } from './common/property-status.enum';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto';

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
      const office = await this.officeService.getCurrentUserOffice(officeManagerId, true);
      if (!office) {
        throw new ForbiddenException('Office not found or access denied');
      }

      const owner = await this.userService.getUser(createPropertyDto.ownerId);
      if (!owner) {
        throw new BadRequestException('Owner not found');
      }
      


      if ((office.officeSubscription?.remaining_properties! < 0) || (office.properties.length > 5)) {
        throw new BadRequestException("You have reached the limit of adding properties, if you wanna add more you can subcripe in the app to increase the number of properties these you can add.");
      }


      const propertyType = await queryRunner.manager.findOne(PropertyType, {
        where: { name: createPropertyDto.propertyType },
      });
      if (!propertyType) throw new NotFoundException('PropertyType not found');

      const licenseType = await queryRunner.manager.findOne(LicenseType, {
        where: { name: createPropertyDto.licenseType },
      });
      if (!licenseType) throw new NotFoundException('LicenseType not found');

      // Save license details
      const license_details = this.licenseDetailsRepository.create({
        licenseNumber: createPropertyDto.licenseNumber,
        date: new Date(),
        license: licenseType,
      });
      await queryRunner.manager.save(license_details);

      // Save location
      const location = this.locationRepository.create(createPropertyDto.location);
      await queryRunner.manager.save(location);

      // Create and save property
      const property = this.propertyRepository.create({
        ...createPropertyDto,
        location,
        owner,
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
      const propertyResposnse: PropertyResponse = property;
      return propertyResposnse;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error
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


  async update(id: string, officeManagerId: string, updateDto: UpdatePropertyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Property, {
        where: { id },
        relations: ['office', 'office.user', 'type', 'propertyAttributes', 'location', 'propertyAttributes.attribute'],
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
      if (updateDto.propertyType) {
        const type = await queryRunner.manager.findOne(PropertyType, {
          where: { name: updateDto.propertyType },
        });
        if (!type) throw new NotFoundException('PropertyType not found');
        existing.type = type;
      }

      // ✅ Update attributes
      if (updateDto.attributes) {
        // Delete old propertyAttributes
        await queryRunner.manager.delete(PropertyAttribute, { property: { id: existing.id } });

        const newAttributes: PropertyAttribute[] = [];
        for (const attrDto of updateDto.attributes) {
          let attribute = await queryRunner.manager.findOne(Attribute, {
            where: { name: attrDto.name },
          });

          if (!attribute) {
            attribute = this.attributeRepository.create({ name: attrDto.name });
            await queryRunner.manager.save(attribute);
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
      const updatableFields = ['propertyNumber', 'space', 'price', 'description'];
      for (const field of updatableFields) {
        if (updateDto[field] !== undefined) {
          existing[field] = updateDto[field];
        }
      }

      const updated: PropertyResponse = await queryRunner.manager.save(existing);
      await queryRunner.commitTransaction();

      return updated;
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
  async findAllAcceptedProperties(): Promise<Property[]> { // Renamed for clarity
    return this.propertyRepository.find({
      where: {
        status: PropertyStatus.Accepted, // <-- Add this line to filter by status
        softDelete: false, // <-- Assuming you also want to exclude soft-deleted properties
      },
      relations: [
        'photos',
        'location',
        'type',
        'licenseDetails',
        'licenseDetails.license', // Include nested relation for license name
        'propertyAttributes',
        'propertyAttributes.attribute', // Include nested relation for attribute name
        'owner', // You might want to include the owner as well for general listings
      ],
      order: {
        publishDate: 'DESC', // Typically, newer accepted properties are shown first
      },
    });
  }




/**
   * Retrieves all properties that are currently in 'pending' status.
   * Includes related entities like photos, location, type, licenseDetails,
   * propertyAttributes, and owner for detailed display.
   * @returns A promise that resolves to an array of Property entities.
   */
  async getAllPropertiesWhoAreStillNotAccepted(): Promise<Property[]> {
    const properties = await this.propertyRepository.find({
      where: {
        status: PropertyStatus.Pending, // Filter by pending status
        softDelete: false, // Ensure it's not soft-deleted
      },
      relations: [
        'photos',        // Load property photos
        'location',      // Load location details
        'type',          // Load property type (e.g., "Office", "Apartment")
        'licenseDetails', // Load license details
        'licenseDetails.license', // Load the actual license type within licenseDetails
        'propertyAttributes', // Load custom attributes (e.g., "Rooms", "Bathrooms")
        'propertyAttributes.attribute', // Load attribute names
        'owner',         // Load the property owner (User entity)
      ],
      order: {
        publishDate: 'ASC', // Order by oldest first for review queue
      },
    });

    if (!properties || properties.length === 0) {
      // You can throw a NotFoundException or simply return an empty array
      // Depending on whether you consider "no pending properties" an error or a normal state.
      // For an admin dashboard, returning an empty array is usually fine.
      console.log('No properties found with pending status.');
      return [];
    }

    return properties;
  }

/**
   * Updates the status of a specific property.
   * @param id The ID of the property to update.
   * @param status The new status (e.g., 'accepted', 'rejected').
   * @returns A promise that resolves to the updated Property entity.
   */
  async updatePropertyStatus(id: string, updatePropertyStatusDto: UpdatePropertyStatusDto): Promise<Property> {
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
            'type',
            'licenseDetails',
            'licenseDetails.license',
            'propertyAttributes',
            'propertyAttributes.attribute',
            'owner',
        ],
    });

    if (!finalProperty) {
        // This case should ideally not happen if `updatedProperty` was successfully saved
        // but it's good for type safety.
        throw new NotFoundException(`Property with ID "${updatedProperty.id}" not found after update.`);
    }

    return finalProperty;
  }


  // async findPropertiesByFiltering(filterDto: FilterPropertyDto) {

  //   const query = this.propertyRepository.createQueryBuilder('property')
  //     .leftJoinAndSelect('property.photos', 'photos')
  //     .leftJoinAndSelect('property.location', 'location')
  //     .leftJoinAndSelect('property.type', 'type')
  //     .leftJoinAndSelect('property.licenseDetails', 'licenseDetails')
  //     .leftJoinAndSelect('property.propertyAttributes', 'propertyAttributes')
  //     .leftJoinAndSelect('propertyAttributes.attribute', 'attribute')
  //     .where('property.softDelete = false');

  //   const {
  //     type,
  //     purpose,
  //     price,
  //     space,
  //     licenseType,
  //     attributeFilters,
  //     location,
  //   } = filterDto;

  //   // Type
  //   if (type) {
  //     query.andWhere('type.name = :type', { type });
  //   }

  //   // Purpose (selling/renting)
  //   if (purpose?.selling && !purpose.renting) {
  //     query.andWhere('licenseDetails.forSelling = true');
  //   }
  //   if (!purpose?.selling && purpose?.renting) {
  //     query.andWhere('licenseDetails.forRenting = true');
  //   }

  //   // Price Range
  //   if (price?.length === 2) {
  //     query.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
  //       minPrice: price[0],
  //       maxPrice: price[1],
  //     });
  //   }

  //   // Space Range
  //   if (space?.length === 2) {
  //     query.andWhere('property.space BETWEEN :minSpace AND :maxSpace', {
  //       minSpace: space[0],
  //       maxSpace: space[1],
  //     });
  //   }

  //   // License Type
  //   if (licenseType) {
  //     query.andWhere('licenseDetails.licenseType = :licenseType', { licenseType });
  //   }

  //   // Location Filters
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

  //   // Attributes: filter by name and value
  //   if (attributeFilters?.length! > 0) {
  //     attributeFilters?.forEach((attr, index) => {
  //       const paramName = `attrValue${index}`;
  //       const paramAttr = `attrName${index}`;

  //       query.andWhere(
  //         `(attribute.name = :${paramAttr} AND propertyAttributes.value = :${paramName})`,
  //         {
  //           [paramAttr]: attr.attribute,
  //           [paramName]: attr.value,
  //         },
  //       );
  //     });
  //   }

  //   return await query.getMany();
  // }


  // async findPropertiesByFiltering(filterDto: FilterPropertyDto) {
  //   const query = this.propertyRepository.createQueryBuilder('property')
  //     .leftJoinAndSelect('property.photos', 'photos')
  //     .leftJoinAndSelect('property.location', 'location')
  //     .leftJoinAndSelect('property.type', 'type')
  //     .leftJoinAndSelect('property.licenseDetails', 'licenseDetails')
  //     .leftJoinAndSelect('property.propertyAttributes', 'propertyAttributes')
  //     .leftJoinAndSelect('propertyAttributes.attribute', 'attribute')
  //     .where('property.softDelete = false');
 
  //   const {
  //     type,
  //     purpose,
  //     price,
  //     space,
  //     licenseType,
  //     attributeFilters,
  //     location,
  //   } = filterDto;

  //   // Type
  //   if (type) {
  //     query.andWhere('type.name = :type', { type });
  //   }

  //   // Purpose (Selling or Renting via typeOperation column)
  //   if (purpose?.selling && !purpose?.renting) {
  //     query.andWhere('property.typeOperation = :typeOp', { typeOp: 'Selling' });
  //   } else if (!purpose?.selling && purpose?.renting) {
  //     query.andWhere('property.typeOperation = :typeOp', { typeOp: 'Renting' });
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
  //     query.andWhere('licenseDetails.licenseType = :licenseType', {
  //       licenseType,
  //     });
  //   }

  //   // Location
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

  //   return query.getMany();
  // }



  async findPropertiesByFiltering(filterDto: FilterPropertyDto) {
  const query = this.propertyRepository.createQueryBuilder('property')
    .leftJoinAndSelect('property.photos', 'photos')
    .leftJoinAndSelect('property.location', 'location')
    .leftJoinAndSelect('property.type', 'type')
    .leftJoinAndSelect('property.licenseDetails', 'licenseDetails')
    .leftJoinAndSelect('licenseDetails.license', 'license') // ✅ Fix
    .leftJoinAndSelect('property.propertyAttributes', 'propertyAttributes')
    .leftJoinAndSelect('propertyAttributes.attribute', 'attribute')
    .where('property.softDelete = false');

  const {
    type,
    purpose,
    price,
    space,
    licenseType,
    attributeFilters,
    location,
  } = filterDto;

  // Type
  if (type) {
    query.andWhere('type.name = :type', { type });
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

  // License Type
  if (licenseType) {
    query.andWhere('license.name = :licenseType', {
      licenseType,
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

  // Dynamic attribute filters
  if (attributeFilters?.length! > 0) {
    attributeFilters?.forEach((attr, index) => {
      const attrNameKey = `attrName${index}`;
      const attrValueKey = `attrValue${index}`;
      query.andWhere(
        `(attribute.name = :${attrNameKey} AND propertyAttributes.value = :${attrValueKey})`,
        {
          [attrNameKey]: attr.attribute,
          [attrValueKey]: attr.value,
        },
      );
    });
  }

  return query.getMany();
}





  async findOne(id: string) {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: [
        'photos',
        'location',
        'type',
        'licenseDetails',
        'propertyAttributes',
        'propertyAttributes.attribute',
      ],
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }



  async findByOfficeId(officeId: string) {
    const property = await this.propertyRepository.find({
      where: {
        office: {
          id: officeId
        }
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
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }


  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const property = await queryRunner.manager.findOne(Property, {
        where: { id },
        relations: ['photos', 'propertyAttributes', 'licenseDetails', 'location'],
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

      return property
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}

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
import { Attribute } from './entities/attribute.entity';
import { PropertyAttribute } from './entities/property_attribute.entity';
import { PropertyPhotos } from './entities/property_photos.entity';
import { PropertyType } from './entities/property_type.entity';
import { LicenseDetails } from './entities/license_details.entity';
import { Office } from 'src/office/entities/office.entity';
import { OfficeService } from 'src/office/office.service';
import { UserAuthService } from 'src/user/services/user-auth.service';
import { LicenseType } from './entities/license_type.entity';
import { PropertyResponse } from './common/property-response.interface';

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
    const office = await this.officeService.getCurrentUserOffice(officeManagerId);
    if (!office) {
      throw new ForbiddenException('Office not found or access denied');
    }

    const owner = await this.userService.getUser(createPropertyDto.ownerId);
    if (!owner) {
      throw new BadRequestException('Owner not found');
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
    const propertyResposnse:PropertyResponse = property;
    return propertyResposnse;
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
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
      relations: ['office', 'office.user', 'type', 'propertyAttributes' ,'location' , 'propertyAttributes.attribute'],
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

    const updated : PropertyResponse  = await queryRunner.manager.save(existing);
    await queryRunner.commitTransaction();
    
    return updated;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw new InternalServerErrorException(err.message);
  } finally {
    await queryRunner.release();
  }
}


  async findAll() {
    return this.propertyRepository.find({
      relations: [
        'photos',
        'location',
        'type',
        'licenseDetails',
        'propertyAttributes',
        'propertyAttributes.attribute',
      ],
    });
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}

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
    private readonly licenseRepository: Repository<LicenseDetails>,
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
        throw new ForbiddenException()
      }

      const owner = await this.userService.getUser(createPropertyDto.ownerId);

      if (!owner) {
        throw new BadRequestException()
      }
      // Find propertyType by ID
      const propertyType = await queryRunner.manager.findOne(PropertyType, {
        where: { name: createPropertyDto.propertyType },
      });
      if (!propertyType) throw new NotFoundException('PropertyType not found');

      // Save location
      const location = this.locationRepository.create(createPropertyDto.location);
      await queryRunner.manager.save(location);

      // Create base property
      const property = this.propertyRepository.create({
        ...createPropertyDto,
        location,
        owner,
        office: office,
        type: propertyType,
        publishDate: new Date(),
        softDelete: false,
        propertyAttributes: [],
      });


      let savedProperty = await queryRunner.manager.save(property);

      // Save attributes
      for (const attrDto of createPropertyDto.attributes) {
        let attribute = await queryRunner.manager.findOne(Attribute, {
          where: { name: attrDto.name },
        });

        if (!attribute) {
          attribute = this.attributeRepository.create({ name: attrDto.name });
          await queryRunner.manager.save(attribute);
        }

        const propertyAttribute = this.propertyAttributeRepository.create({
          property: savedProperty,
          attribute,
          value: attrDto.value,
        });
        savedProperty.propertyAttributes.push(propertyAttribute)
        await queryRunner.manager.save(propertyAttribute);
      }

      // Upload photos
      for (const file of property_photos) {
        const uploadRes = await this.cloudinaryService.uploadImage(file);
        const photo = this.photoRepository.create({
          property: savedProperty,
          url: uploadRes.secure_url,
          public_id: uploadRes.public_id,
        });
        await queryRunner.manager.save(photo);
      }
    savedProperty =  await queryRunner.manager.save(savedProperty)
      await queryRunner.commitTransaction();

      return savedProperty;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
  // for (const propertyAttribut of createPropertyDto.attributes) {
  //   const attribute = await queryRunner.manager.findOne(Attribute, {
  //     where: {
  //       name: propertyAttribut.name
  //     }
  //   })
  // if (!attribute) throw new NotFoundException('Attribute not found');
  //   const newPropertyAttribute = this.propertyAttributeRepository.create({
  //     property,
  //     attribute,
  //     value:propertyAttribut.value
  //   })
  //   await queryRunner.manager.save(newPropertyAttribute);
  // }

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

  async update(id: string, updateDto: UpdatePropertyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Property, {
        where: { id },
        relations: ['location', 'type'],
      });

      if (!existing) throw new NotFoundException('Property not found');

      if (updateDto.location) {
        Object.assign(existing.location, updateDto.location);
        await queryRunner.manager.save(existing.location);
      }

      if (updateDto.propertyType) {
        const type = await queryRunner.manager.findOne(PropertyType, {
          where: { id: updateDto.propertyType },
        });
        if (!type) throw new NotFoundException('PropertyType not found');
        existing.type = type;
      }

      Object.assign(existing, updateDto);
      const updated = await queryRunner.manager.save(existing);

      await queryRunner.commitTransaction();
      return updated;
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
      if (property.licenseDetails) {
        await queryRunner.manager.remove(property.licenseDetails);
      }

      // Remove location
      await queryRunner.manager.remove(property.location);

      // Remove property
      await queryRunner.manager.remove(property);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}

// src/property/property.service.ts

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PropertyPhotos } from './entities/property_photos.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(PropertyPhotos)
    private readonly photosRepository: Repository<PropertyPhotos>,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createDto: CreatePropertyDto, property_photos: Express.Multer.File[]) {
  console.log(createDto);
  
    return;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const property = this.propertyRepository.create({
        
      });

      const savedProperty = await queryRunner.manager.save(property);

      // upload images
      for (const file of property_photos) {
        const uploadRes = await this.cloudinaryService.uploadImage(file);
        const photo = this.photosRepository.create({
          property: savedProperty,
          public_id: uploadRes.public_id,
          url: uploadRes.secure_url,
        });
        await queryRunner.manager.save(photo);
      }

      await queryRunner.commitTransaction();
      return savedProperty;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.propertyRepository.find({
      relations: ['photos', 'type', 'location', 'licenseDetails', 'propertyAttributes'],
    });
  }

  async findOne(id: string) {
    const property = await this.propertyRepository.findOne({
      where: {  id },
      relations: ['photos', 'type', 'location', 'licenseDetails', 'propertyAttributes'],
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
        where: {  id },
      });
      if (!existing) throw new NotFoundException('Property not found');
      Object.assign(existing, updateDto);
      const updated = await queryRunner.manager.save(existing);
      await queryRunner.commitTransaction();
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
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
        where: {  id },
        relations: ['photos'],
      });
      if (!property) throw new NotFoundException('Property not found');

      // delete images from cloudinary
      for (const photo of property.photos) {
        await this.cloudinaryService.deleteImage(photo.id);
        await queryRunner.manager.remove(photo);
      }

      await queryRunner.manager.remove(property);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}

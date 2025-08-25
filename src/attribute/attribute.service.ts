import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { PropertyTypeAttribute } from 'src/property/entities/propertyType_attribute.entity';
import { LinkAttributesToPropertyTypeDto } from './dto/link-Attributes-To-PropertyType.dto';
import { PropertyType } from 'src/property-type/entities/property-type.entity';

@Injectable()
export class AttributeService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createDto: CreateAttributeDto): Promise<Attribute> {
    const attribute = this.attributeRepository.create(createDto);
    return await this.attributeRepository.save(attribute);
  }


  // async linkAttributesToPropertyType(linkAttributesToPropertyTypeDto: LinkAttributesToPropertyTypeDto) {

  //   const queryRunner = await this.dataSource.createQueryRunner();
  //   await queryRunner.startTransaction()
  //   try {


  //     const propertyType = await queryRunner.manager.findOne(PropertyType, { where: { id: linkAttributesToPropertyTypeDto.propertyTypeId } });
  //     if (!propertyType) throw new NotFoundException('Property Type not found');

  //     const attributes = await this.attributeRepository.findByIds(linkAttributesToPropertyTypeDto.attributeIds);

  //     const links = attributes.map(attr => {
  //       const link = new PropertyTypeAttribute();
  //       link.propertyType = propertyType;
  //       link.attribute = attr;
  //       return link;
  //     });

  //     return await queryRunner.manager.save(PropertyTypeAttribute, links);

  //     queryRunner.commitTransaction()
  //   } catch (error) {
  //     queryRunner.rollbackTransaction()
  //     throw error
  //   } finally {
  //     queryRunner.release()
  //   }
  // }





  async linkAttributesToPropertyType(linkAttributesToPropertyTypeDto: LinkAttributesToPropertyTypeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const { propertyTypeId, attributeIds } = linkAttributesToPropertyTypeDto;

      const propertyType = await queryRunner.manager.findOne(PropertyType, { where: { id: propertyTypeId } });
      if (!propertyType) {
        throw new NotFoundException('Property Type not found');
      }

      // Fetch existing linked attributes for this property type
      const existingLinks = await queryRunner.manager.find(PropertyTypeAttribute, {
        where: { propertyType: { id: propertyTypeId } },
        relations: ['attribute']
      });

      const existingAttributeIds = new Set(existingLinks.map(link => link.attribute.id));
      const newAttributeIds = new Set(attributeIds);

      // Find attributes to remove
      const idsToRemove = existingLinks
        .filter(link => !newAttributeIds.has(link.attribute.id))
        .map(link => link.id);

      // Find attributes to add
      const idsToAdd = attributeIds.filter(id => !existingAttributeIds.has(id));

      // Remove old links
      if (idsToRemove.length > 0) {
        await queryRunner.manager.delete(PropertyTypeAttribute, idsToRemove);
      }

      // Add new links
      if (idsToAdd.length > 0) {
        const attributesToAdd = await queryRunner.manager.find(Attribute, {
          where: { id: In(idsToAdd) },
        });

        const newLinks = attributesToAdd.map(attr => {
          const link = new PropertyTypeAttribute();
          link.propertyType = propertyType;
          link.attribute = attr;
          return link;
        });

        await queryRunner.manager.save(PropertyTypeAttribute, newLinks);
      }

      await queryRunner.commitTransaction();
      return await queryRunner.manager.findOne(PropertyType, {
        where: { id: propertyTypeId },
        relations: ['attributes', 'attributes.attribute']
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Attribute[]> {
    return await this.attributeRepository.find({
      // relations: ['attributes', 'properties'], // optional if needed
    });
  }

  async findOne(id: string): Promise<Attribute> {
    const attribute = await this.attributeRepository.findOne({
      where: { id },
      // relations: ['attributes', 'properties'],
    });

    if (!attribute) throw new NotFoundException(`Attribute #${id} not found`);
    return attribute;
  }

  async update(
    id: string,
    updateDto: UpdateAttributeDto,
  ): Promise<Attribute> {
    const attribute = await this.findOne(id);
    const updated = Object.assign(attribute, updateDto);
    return await this.attributeRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.attributeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Attribute #${id} not found`);
    }
  }
}

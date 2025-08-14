import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { PropertyType } from 'src/property-type/entities/property-type.entity';
import { PropertyTypeAttribute } from 'src/property/entities/propertyType_attribute.entity';
import { LinkAttributesToPropertyTypeDto } from './dto/link-Attributes-To-PropertyType.dto';

@Injectable()
export class AttributeService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,

    @InjectRepository(PropertyType)
    private readonly propertyTypeRepository: Repository<PropertyType>,

    @InjectRepository(PropertyTypeAttribute)
    private readonly propertyTypeAttributeRepository: Repository<PropertyTypeAttribute>,
  ) {}

  async create(createDto: CreateAttributeDto): Promise<Attribute> {
    const attribute = this.attributeRepository.create(createDto);
    return await this.attributeRepository.save(attribute);
  }

  async linkAttributesToPropertyType(linkAttributesToPropertyTypeDto: LinkAttributesToPropertyTypeDto) {
    const propertyType = await this.propertyTypeRepository.findOne({ where: { id: linkAttributesToPropertyTypeDto.propertyTypeId } });
    if (!propertyType) throw new NotFoundException('Property Type not found');

    const attributes = await this.attributeRepository.findByIds(linkAttributesToPropertyTypeDto.attributeIds);

    const links = attributes.map(attr => {
      const link = new PropertyTypeAttribute();
      link.propertyType = propertyType;
      link.attribute = attr;
      return link;
    });

    return await this.propertyTypeAttributeRepository.save(links);
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

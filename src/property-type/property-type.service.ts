import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyType } from './entities/property-type.entity';
import { UpdatePropertyTypeDto } from './dto/update-property-type.dto';
import { CreatePropertyTypeDto } from './dto/create-property-type.dto copy';

@Injectable()
export class PropertyTypeService {
  constructor(
    @InjectRepository(PropertyType)
    private readonly propertyTypeRepository: Repository<PropertyType>,
  ) {}

  async create(createDto: CreatePropertyTypeDto): Promise<PropertyType> {
    const propertyType = this.propertyTypeRepository.create(createDto);
    return await this.propertyTypeRepository.save(propertyType);
  }

  async findAll(): Promise<PropertyType[]> {
    return await this.propertyTypeRepository.find({
      // relations: ['attributes', 'properties'], // optional if needed
    });
  }

  async findOne(id: string): Promise<PropertyType> {
    const type = await this.propertyTypeRepository.findOne({
      where: { id },
      // relations: ['attributes', 'properties'],
    });

    if (!type) throw new NotFoundException(`PropertyType #${id} not found`);
    return type;
  }

  async update(
    id: string,
    updateDto: UpdatePropertyTypeDto,
  ): Promise<PropertyType> {
    const type = await this.findOne(id);
    const updated = Object.assign(type, updateDto);
    return await this.propertyTypeRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.propertyTypeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`PropertyType #${id} not found`);
    }
  }
}

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

@Injectable()
export class AttributeService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
  ) {}

  async create(createDto: CreateAttributeDto): Promise<Attribute> {
    const attribute = this.attributeRepository.create(createDto);
    return await this.attributeRepository.save(attribute);
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

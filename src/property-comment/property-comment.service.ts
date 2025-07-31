


import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Office } from 'src/office/entities/office.entity';
import { UserAuthService } from 'src/user/services/user-auth.service';

import { InjectRepository } from '@nestjs/typeorm';
import { PropertyComment } from './entities/property-comment.entity';
import { Property } from 'src/property/entities/property.entity';
import { CreatePropertyCommentDto } from './dto/create-property-comment.dto';
import { UpdatePropertyCommentDto } from './dto/update-property-comment.dto';

@Injectable()
export class PropertyCommentService {
  constructor(
    @InjectRepository(PropertyComment)
    private readonly propertyCommentRepository: Repository<PropertyComment>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly userAuthService: UserAuthService,
    private readonly dataSource: DataSource,
  ) { }

  async create(userId: string, createPropertyCommentDto: CreatePropertyCommentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { propertyId, content } = createPropertyCommentDto;

      const user = await this.userAuthService.getUser(userId);
      if (!user) throw new NotFoundException('User not found');

      const property = await this.propertyRepository.findOne({
        where: { id: propertyId },
      });
      if (!property) throw new NotFoundException('Property not found');

      const comment = queryRunner.manager.create(PropertyComment, {
        content,
        user,
        property,
      });

      await queryRunner.manager.save(comment);
      await queryRunner.commitTransaction();

      return comment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.propertyCommentRepository.find({
      relations: ['user', 'property'],
      order: { id: 'DESC' },
    });
  }

  async findAllByPropertyId(propertyId: string) {
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    return this.propertyCommentRepository.find({
      where: { property: { id: propertyId } },
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string) {
    const comment = await this.propertyCommentRepository.findOne({
      where: { id },
      relations: ['user', 'property'],
    });

    if (!comment) throw new NotFoundException('Property comment not found');
    return comment;
  }

  async update(userId: string, propertyId: string, updatePropertyCommentDto: UpdatePropertyCommentDto) {
    const comment = await this.propertyCommentRepository.findOne({ where: { id: propertyId, user: { id: userId } } });

    if (!comment) throw new NotFoundException('Property comment not found');

    // Object.assign(comment, updateOfficeCommentDto);
    comment.content = updatePropertyCommentDto.content;
    return this.propertyCommentRepository.save(comment);
  }

  async remove(userId: string, propertyId: string) {
    const comment = await this.propertyCommentRepository.findOne({
      where: {
        id: propertyId, user: {
          id: userId
        }
      }
    });

    if (!comment) throw new NotFoundException('Property comment not found');

    await this.propertyCommentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}


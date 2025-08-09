import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateLicenseTypeDto } from './dto/create-license-type.dto';
import { UpdateLicenseTypeDto } from './dto/update-license-type.dto';
import { LicenseType } from './entities/license_type.entity';

@Injectable()
export class LicenseTypeService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateLicenseTypeDto): Promise<LicenseType> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const licenseType = queryRunner.manager.create(LicenseType, {
        name: createDto.name,
      });

      await queryRunner.manager.save(licenseType);
      await queryRunner.commitTransaction();

      return licenseType;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create license type');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<LicenseType[]> {
    return this.dataSource.getRepository(LicenseType).find();
  }

  async findOne(id: string): Promise<LicenseType> {
    const licenseType = await this.dataSource
      .getRepository(LicenseType)
      .findOneBy({ id });

    if (!licenseType) {
      throw new NotFoundException(`LicenseType with id ${id} not found`);
    }

    return licenseType;
  }

  async update(
    id: string,
    updateDto: UpdateLicenseTypeDto,
  ): Promise<LicenseType> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const licenseType = await queryRunner.manager.findOne(LicenseType, {
        where: { id },
      });

      if (!licenseType) {
        throw new NotFoundException(`LicenseType with id ${id} not found`);
      }

      licenseType.name = updateDto.name;

      await queryRunner.manager.save(licenseType);
      await queryRunner.commitTransaction();

      return licenseType;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const licenseType = await queryRunner.manager.findOne(LicenseType, {
        where: { id },
      });

      if (!licenseType) {
        throw new NotFoundException(`LicenseType with id ${id} not found`);
      }

      await queryRunner.manager.remove(licenseType);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

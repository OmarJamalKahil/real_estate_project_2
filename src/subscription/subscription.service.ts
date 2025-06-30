import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly dataSource: DataSource,
  ) {}

  // CREATE
  async create(createDto: CreateSubscriptionDto): Promise<Subscription> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const subscription = this.subscriptionRepository.create(createDto);
      const saved = await queryRunner.manager.save(subscription);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create subscription');
    } finally {
      await queryRunner.release();
    }
  }

  // READ ALL
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  // READ ONE
  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id } });
    if (!subscription) throw new NotFoundException(`Subscription #${id} not found`);
    return subscription;
  }

  // UPDATE
  async update(id: string, updateDto: UpdateSubscriptionDto): Promise<Subscription> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const subscription = await queryRunner.manager.findOne(Subscription, { where: { id } });
      if (!subscription) throw new NotFoundException(`Subscription #${id} not found`);

      Object.assign(subscription, updateDto);
      const updated = await queryRunner.manager.save(subscription);

      await queryRunner.commitTransaction();
      return updated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to update subscription');
    } finally {
      await queryRunner.release();
    }
  }

  // DELETE
  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const subscription = await queryRunner.manager.findOne(Subscription, { where: { id } });
      if (!subscription) throw new NotFoundException(`Subscription #${id} not found`);

      await queryRunner.manager.remove(subscription);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to delete subscription');
    } finally {
      await queryRunner.release();
    }
  }
}

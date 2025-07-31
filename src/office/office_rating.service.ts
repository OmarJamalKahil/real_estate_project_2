import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Office } from './entities/office.entity';
import { OfficeRating } from './entities/office_rating.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class OfficeRatingService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(OfficeRating)
    private readonly officeRatingRepository: Repository<OfficeRating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Rate an office:
   * - update the rating if exists
   * - create if it does not exist
   * Uses a transaction with query runner.
   */
  async rateOffice(officeId: string, userId: string, rating: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await queryRunner.manager.findOne(Office, {
        where: { id: officeId },
        relations: ['ratings'],
      });

      if (!office) throw new NotFoundException('Office not found');

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      let officeRating = await queryRunner.manager.findOne(OfficeRating, {
        where: {
          office: { id: officeId },
          user: { id: userId },
        },
        relations: ['user', 'office'],
      });

      if (officeRating) {
        // update
        officeRating.rating = rating;
      } else {
        // create
        officeRating = queryRunner.manager.create(OfficeRating, {
          user,
          office,
          rating,
        });
      }

      await queryRunner.manager.save(officeRating);

      await queryRunner.commitTransaction();
      return officeRating;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get the average rating of each office
   * returns: [{ officeId, averageRating }]
   */
  async getOfficeAverageRatings() {
    const averages = await this.officeRatingRepository
      .createQueryBuilder('rating')
      .select('rating.officeId', 'officeId')
      .addSelect('AVG(rating.rating)', 'averageRating')
      .groupBy('rating.officeId')
      .getRawMany();

    return averages.map((a) => ({
      officeId: a.officeId,
      averageRating: Number(a.averageRating),
    }));
  }
}

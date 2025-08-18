import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Office } from './entities/office.entity';
import { OfficeRating } from './entities/office_rating.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateOrUpdateOfficeRatingDto } from './dto/create-or-update-office-rating.dto';

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
  async rateOffice( userId: string, createOrUpdateOfficeRatingDto: CreateOrUpdateOfficeRatingDto,) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await queryRunner.manager.findOne(Office, {
        where: { id: createOrUpdateOfficeRatingDto.officeId },
        relations: ['ratings'],
      });

      if (!office) throw new NotFoundException('Office not found');

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      let officeRating = await queryRunner.manager.findOne(OfficeRating, {
        where: {
          office: { id: createOrUpdateOfficeRatingDto.officeId },
          user: { id: userId },
        },
        relations: ['user', 'office'],
      });

      if (officeRating) {
        // update
        officeRating.number_of_stars = createOrUpdateOfficeRatingDto.numberOfStars;
        officeRating.user = user;
        officeRating.office = office;
      } else {
        // create
        officeRating = queryRunner.manager.create(OfficeRating, {
          user,
          office,
          number_of_stars: createOrUpdateOfficeRatingDto.numberOfStars,
        });
      }

      await queryRunner.manager.save(officeRating);

      await queryRunner.commitTransaction();
      // return officeRating;
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
      .addSelect('AVG(rating.number_of_stars)', 'averageRating')
      .groupBy('rating.officeId')
      .getRawMany();

    return averages.map((a) => ({
      officeId: a.officeId,
      averageRating: Number(a.averageRating),
    }));
  }
}

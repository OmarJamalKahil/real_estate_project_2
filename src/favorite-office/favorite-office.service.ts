import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteOffice } from './entities/favorite-office.entity';
import { Repository, DataSource } from 'typeorm';
import { Office } from 'src/office/entities/office.entity';
import { UserAuthService } from 'src/user/services/user-auth.service';
import { CreateFavoriteOfficeDto } from './dto/create-favorite-office.dto';

@Injectable()
export class FavoriteOfficeService {
  constructor(
    @InjectRepository(FavoriteOffice)
    private readonly favoriteOfficeRepository: Repository<FavoriteOffice>,

    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,

    private readonly userService: UserAuthService,

    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateFavoriteOfficeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userService.getUser(userId);
      if (!user) throw new NotFoundException('User not found');

      const office = await this.officeRepository.findOne({
        where: { id: dto.officeId },
      });
      if (!office) throw new NotFoundException('Office not found');

      const existingFavorite = await this.favoriteOfficeRepository.findOne({
        where: {
          user: { id: user.id },
          office: { id: office.id },
        },
      });

      if (existingFavorite)
        throw new ConflictException('Office already in favorites');

      const favorite = this.favoriteOfficeRepository.create({ user, office });
      await queryRunner.manager.save(favorite);

      await queryRunner.commitTransaction();
      return favorite;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  // this is old

  // async findAllFavoriteOfficeByUserId(userId: string) {
  //   const user = await this.userService.getUser(userId);
  //   if (!user) throw new NotFoundException('User not found');

  //   return this.favoriteOfficeRepository.find({
  //     where: { user: { id: user.id } },
  //     relations: ['office','office.office_photo'],
  //   });
  // }

  // this is omar
  async findAllFavoriteOfficeByUserId(userId: string) {
    const user = await this.userService.getUser(userId);
    if (!user) throw new NotFoundException('User not found');

    const result = await this.favoriteOfficeRepository
      .createQueryBuilder('favoriteOffice')
      .leftJoinAndSelect('favoriteOffice.office', 'office')
      .leftJoinAndSelect('office.office_photo', 'officePhoto')
      .leftJoin('office.ratings', 'rating')
      .addSelect('AVG(rating.number_of_stars)', 'averageRating')
      .where('favoriteOffice.userId = :userId', { userId: user.id })
      .groupBy('favoriteOffice.id')
      .addGroupBy('office.id')
      .addGroupBy('officePhoto.id')
      .getRawAndEntities();

    return result.entities.map((fav, idx) => {
      const avg = parseFloat(result.raw[idx].averageRating) || 0;
      return {
        ...fav,
        office: {
          ...fav.office,
          averageRating: avg,
        },
      };
    });
  }

  async removeByUserId(userId: string, officeId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userService.getUser(userId);
      if (!user) throw new NotFoundException('User not found');

      const favorite = await this.favoriteOfficeRepository.findOne({
        where: {
          user: { id: user.id },
          office: { id: officeId },
        },
      });

      if (!favorite) throw new NotFoundException('Favorite not found');

      await queryRunner.manager.remove(FavoriteOffice, favorite);
      await queryRunner.commitTransaction();

      return { message: 'Favorite office removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async removeAllByUserId(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userService.getUser(userId);
      if (!user) throw new NotFoundException('User not found');

      const favorites = await this.favoriteOfficeRepository.find({
        where: { user: { id: user.id } },
      });

      if (favorites.length === 0) {
        return { message: 'No favorite offices found for this user' };
      }

      await queryRunner.manager.remove(FavoriteOffice, favorites);

      await queryRunner.commitTransaction();
      return { message: 'All favorite offices removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * this func check if the office is in your favorite list
   * @param userId the id of the user requesting the func
   * @param officeId the id of the office
   * @returns a boolean value, if (true) then the office is in favorite list
   */
  async checkIfOfficeIsFavorite(userId: string, officeId: string) {
    const thisOfficeIsFavorite = await this.favoriteOfficeRepository.exists({
      where: { office: { id: officeId }, user: { id: userId } },
    });

    return thisOfficeIsFavorite;
  }
}

import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFavoritePropertyDto } from './dto/create-favorite-property.dto';
import { UpdateFavoritePropertyDto } from './dto/update-favorite-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoriteProperty } from './entities/favorite-property.entity';
import { DataSource, Repository } from 'typeorm';
import { Property } from 'src/property/entities/property.entity';
import { UserAuthService } from 'src/user/services/user-auth.service';

@Injectable()
export class FavoritePropertyService {
  constructor(
    @InjectRepository(FavoriteProperty)
    private readonly favoritePropertyRepository: Repository<FavoriteProperty>,

    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,

    private readonly userService: UserAuthService,

    private readonly dataSource: DataSource,
  ) { }




  async create(userId: string, dto: CreateFavoritePropertyDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userService.getUser(userId);
      if (!user) throw new NotFoundException('User not found');

      const property = await this.propertyRepository.findOne({
        where: { id: dto.propertyId },
      });
      if (!property) throw new NotFoundException('Property not found');

      const existingFavorite = await this.favoritePropertyRepository.findOne({
        where: {
          user: { id: user.id },
          property: { id: property.id },
        },
      });

      if (existingFavorite)
        throw new ConflictException('Proprety already in favorites');

      const favorite = this.favoritePropertyRepository.create({ user, property });
      await queryRunner.manager.save(favorite);

      await queryRunner.commitTransaction();
      return favorite;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error
      // throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllFavoritePropertyByUserId(userId: string) {
    const user = await this.userService.getUser(userId);
    if (!user) throw new NotFoundException('User not found');

    return this.favoritePropertyRepository.find({
      where: { user: { id: user.id } },
      relations: ['property','property.photos'],
    });
  }

  async removeByUserId(userId: string, propertyId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userService.getUser(userId);
      if (!user) throw new NotFoundException('User not found');

      const favorite = await this.favoritePropertyRepository.findOne({
        where: {
          user: { id: user.id },
          property: { id: propertyId },
        },
        relations:['user','property']
      });

      if (!favorite) throw new NotFoundException('Favorite not found');

      await queryRunner.manager.remove(FavoriteProperty, favorite);
      await queryRunner.commitTransaction();

      return propertyId;
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

      const favorites = await this.favoritePropertyRepository.find({
        where: { user: { id: user.id } },
      });

      if (favorites.length === 0) {
        return { message: 'No favorite properties found for this user' };
      }

      await queryRunner.manager.remove(FavoriteProperty, favorites);

      await queryRunner.commitTransaction();
      return { message: 'All favorite properties removed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }




}







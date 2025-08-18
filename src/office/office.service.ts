
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Office } from './entities/office.entity';
import { Role, User } from 'src/user/entities/user.entity';
import { OfficeRating } from './entities/office_rating.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { UpdateOfficeStatusDto } from './dto/update-office-status.dto';
import { PaginationDto } from 'src/common/utils/pagination.dto';
import { PaginatedResponse } from 'src/common/utils/paginated-response.interface';
import { OfficeSubscription } from 'src/office-subscription/entities/office-subscription.entity';
import { NotificationService } from 'src/notification/notification.service';
import { EnumStatus } from 'src/property/common/property-status.enum';
import { LicensePhoto } from './entities/license_photo.entity';
import { Photo } from 'src/common/entities/Photo.entity';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(LicensePhoto)
    private readonly licensePhotoRepository: Repository<LicensePhoto>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OfficeRating)
    private readonly officeRatingRepository: Repository<OfficeRating>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,
    private readonly dataSource: DataSource,
  ) { }



  async create(
    createOfficeDto: CreateOfficeDto,
    userId: string,
    license_photo?: Express.Multer.File,
    office_photo?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!license_photo || !office_photo) {
        throw new BadRequestException(
          'license_photo or office_photo is missed',
        );
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');

      const existingOffice = await queryRunner.manager.findOne(Office, {
        where: { user: { id: user.id } },
      });

      if (existingOffice) {
        throw new BadRequestException("You can't have multiple offices");
      }

      const uploadedLicense = await this.cloudinaryService.uploadImage(license_photo);
      const uploadedOffice = await this.cloudinaryService.uploadImage(office_photo);

      const licensePhoto = queryRunner.manager.create(LicensePhoto, {
        url: uploadedLicense.secure_url,
        public_id: uploadedLicense.public_id,
      });
      await queryRunner.manager.save(licensePhoto);

      const officePhotoEntity = queryRunner.manager.create(Photo, {
        url: uploadedOffice.secure_url,
        public_id: uploadedOffice.public_id,
      });
      await queryRunner.manager.save(Photo, officePhotoEntity);

      const newOffice = queryRunner.manager.create(Office, {
        ...createOfficeDto,
        user,
        license_photo: licensePhoto,
        office_photo: officePhotoEntity,
      });
      await queryRunner.manager.save(Office, newOffice);

      await queryRunner.commitTransaction();

      return {
        message: 'We will review your office creation request shortly.',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }




  /**
   * Get all offices with average ratings
   */
  async getAllOfficesWithAverageRating(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Use a subquery to get the total count correctly
    const countQuery = this.officeRepository
      .createQueryBuilder('office')
      .where('office.status = :status', { status: 'accepted' })
      .andWhere('office.user.id != :userId', { userId });

    const total = await countQuery.getCount();

    const query = this.officeRepository
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.office_photo', 'office_photo')
      .leftJoinAndSelect('office.blogs', 'blogs')
      .leftJoin('office.ratings', 'ratings')
      .select([
        'office.id',
        'office.name',
        'office.office_phone',
        'office.office_email',
        'office.status',
        'office_photo',
        'blogs',
      ])
      .addSelect('AVG(ratings.number_of_stars)', 'office_avg_rating')
      .addSelect('COUNT(ratings.id)', 'ratingsCount') // To get the count of ratings for each office
      .where('office.status = :status', { status: 'accepted' })
      .andWhere('office.user.id != :userId', { userId })
      .groupBy('office.id')
      .addGroupBy('office_photo.id')
      .addGroupBy('blogs.id')
      .skip(skip)
      .take(limit);

    // Get raw data and format the result
    const data = await query.getRawMany();

    const offices = data.map((office: any) => ({
      id: office.office_id, // raw query data uses table alias + column name
      name: office.office_name,
      office_phone: office.office_office_phone,
      office_email: office.office_office_email,
      status: office.office_status,
      // Manually reconstruct nested objects from raw data
      office_photo: {
        id: office.office_photo_id,
        url: office.office_photo_url,
        // ...other photo properties
      },
      // The `blogs` relation is also a raw join, so you'd need to handle this manually.
      // A better approach is to load the `blogs` relation in a second query or handle them carefully.
      // For this example, we'll simplify.
      blogs: office.blogs_id ? [{
        id: office.blogs_id,
        title: office.blogs_title,
        // ...other blog properties
      }] : [],
      averageRating: parseFloat(office.office_avg_rating) || 0,
      ratingsCount: parseInt(office.ratingsCount) || 0,
    }));

    return {
      data: offices,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }


  /**
   * Get single office by id with ratings
   */
  async findOne(officeId: string) {
    // First query to get office data
    const office = await this.officeRepository
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.office_photo', 'office_photo')
      .leftJoinAndSelect('office.blogs', 'blogs')
      .where('office.id = :officeId', { officeId })
      .getOne();

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Second query to get average rating
    const avgResult = await this.officeRepository
      .createQueryBuilder('office')
      .leftJoin('office.ratings', 'ratings')
      .select('AVG(ratings.number_of_stars)', 'avg_rating')
      .where('office.id = :officeId', { officeId })
      .getRawOne();

    return {
      id: office.id,
      name: office.name,
      office_phone: office.office_phone,
      office_photo: office.office_photo,
      ratingsCount: Number(avgResult?.avg_rating) || 0,
      blogs: office.blogs,
    };
  }

  // Alternative single-query approach for findOne:
  async findOneAlternative(officeId: string) {
    const result = await this.officeRepository
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.office_photo', 'office_photo')
      .leftJoinAndSelect('office.blogs', 'blogs')
      .leftJoin('office.ratings', 'ratings')
      .addSelect('AVG(ratings.number_of_stars)', 'office_avg_rating')
      .where('office.id = :officeId', { officeId })
      .groupBy('office.id')
      .addGroupBy('office_photo.id')
      .addGroupBy('blogs.id')
      .getRawAndEntities();

    if (!result.entities.length) {
      throw new NotFoundException('Office not found');
    }

    const office = result.entities[0];
    const rawData = result.raw[0];

    return {
      id: office.id,
      name: office.name,
      office_phone: office.office_phone,
      office_photo: office.office_photo,
      ratingsCount: Number(rawData.office_avg_rating) || 0,
      blogs: office.blogs,
    };
  }





  // /**
  //  * Get single office by id with ratings
  //  */
  // async findOne(officeId: string) {
  //   const office = await this.officeRepository
  //     .createQueryBuilder('office')
  //     .leftJoinAndSelect('office.office_photo', 'office_photo')
  //     .leftJoinAndSelect('office.blogs', 'blogs')
  //     .leftJoin('office.ratings', 'rating')
  //     .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
  //     .where('office.id = :officeId', { officeId })
  //     .select(['office', 'office_photo', 'blogs'])
  //     .getOne();

  //   if (!office) {
  //     throw new NotFoundException('Office not found');
  //   }

  //   return {
  //     id: office.id,
  //     name: office.name,
  //     office_phone: office.office_phone,
  //     office_photo: office.office_photo,
  //     ratingsCount: office['ratingsCount'],
  //     blogs: office.blogs,
  //   };
  // }

  /**
   * Get the current user's office with ratings and blogs
   */
  async getCurrentUserOffice(userId: string, withSubscription: boolean = false) {
    const query = this.officeRepository
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.office_photo', 'office_photo')
      .leftJoinAndSelect('office.blogs', 'blogs')
      .leftJoinAndSelect('office.properties', 'Property')
      .leftJoinAndSelect('blogs.blog_media', 'blog_media')
      .leftJoin('office.ratings', 'rating')
      .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
      .where('office.user.id = :userId', { userId });

    if (withSubscription) {
      query.leftJoinAndSelect('office.officeSubscription', 'OfficeSubscription')
        .leftJoinAndSelect('OfficeSubscription.subscription', 'Subscription'); // if you also want the Subscription info
    }

    const office = await query.getOne();
    return office;
  }



  async getAllOfficesWhichAreStillNotAccepted(paginationDto: PaginationDto) {

    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.officeRepository.findAndCount({
      skip: (page - 1) * limit, // ✅ apply offset
      take: limit,
      where: {
        status: EnumStatus.Pending
      },
      relations: ['user', 'license_photo', 'office_photo']

    })

    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };


  }
  // async getCurrentUserOffice(userId: string, withSubscription: boolean = false) {
  //   let office;

  //   if (withSubscription) {
  //     office = await this.officeRepository
  //       .createQueryBuilder('office')
  //       .leftJoinAndSelect('office.office_photo', 'office_photo')
  //       .leftJoinAndSelect('office.blogs', 'blogs')
  //       .leftJoinAndSelect('office.officeSubscription', 'OfficeSubscription')
  //       .leftJoinAndSelect('blogs.blog_media', 'blog_media')  // ADD THIS
  //       .leftJoin('office.ratings', 'rating')
  //       .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
  //       .where('office.user.id = :userId', { userId }) // correct condition
  //       .select([
  //         'office',
  //         'office_photo',
  //         'blogs',
  //         'blog_media', // ADD THIS
  //         'officeSubscription'
  //       ])
  //       .getOne();
  //   } else {

  //     office = await this.officeRepository
  //       .createQueryBuilder('office')
  //       .leftJoinAndSelect('office.office_photo', 'office_photo')
  //       .leftJoinAndSelect('office.blogs', 'blogs')
  //       .leftJoinAndSelect('blogs.blog_media', 'blog_media')  // ADD THIS
  //       .leftJoin('office.ratings', 'rating')
  //       .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
  //       .where('office.user.id = :userId', { userId }) // correct condition
  //       .select([
  //         'office',
  //         'office_photo',
  //         'blogs',
  //         'blog_media', // ADD THIS
  //       ])
  //       .getOne();

  //   }


  //   if (!office) {
  //     throw new NotFoundException('Office not found for this user');
  //   }

  //   return {
  //     id: office.id,
  //     name: office.name,
  //     office_phone: office.office_phone,
  //     office_photo: office.office_photo,
  //     ratingsCount: office['ratingsCount'],
  //     blogs: office.blogs,
  //   };
  // }



  /**
   * Update office information (and optionally license photo)
   */
  async update(
    officeId: string,
    updateOfficeDto: UpdateOfficeDto,
    userId: string,
    office_photo?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await this.officeRepository
        .createQueryBuilder('office')
        .leftJoinAndSelect('office.office_photo', 'office_photo')
        .leftJoinAndSelect('office.user', 'user')
        .leftJoinAndSelect('office.blogs', 'blogs')
        .leftJoin('office.ratings', 'rating')
        .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
        .where('office.id = :officeId', { officeId })
        .select(['office', 'office_photo', 'user'])
        .getOne();

      // const office = await this.officeRepository.findOne({
      //   where: { id: officeId },
      //   relations: ['office_photo','user'],
      // });

      if (!office) throw new NotFoundException('Office not found');

      if (office.user.id !== userId) {
        throw new ForbiddenException("it's forbidden to do this!");
      }

      if (office_photo) {
        if (office.office_photo?.public_id) {
          await this.cloudinaryService.deleteImage(
            office.office_photo.public_id,
          );
        }
        const uploaded = await this.cloudinaryService.uploadImage(office_photo);
        office.office_photo.url = uploaded.secure_url;
        office.office_photo.public_id = uploaded.public_id;
        await queryRunner.manager.save(office.office_photo);
      }

      Object.assign(office, updateOfficeDto);
      console.log(updateOfficeDto);

      await queryRunner.manager.save(office);

      await queryRunner.commitTransaction();
      return { message: 'We will review your new office information nearly.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Change the status of an office (approve / reject / pending)
   */
  async updatingStatus(
    id: string,
    updateOfficeStatusDto: UpdateOfficeStatusDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await this.officeRepository.findOne({
        where: { id },
        relations: ['user']
      });
      if (!office) throw new NotFoundException('Office not found');

      const user = await queryRunner.manager.findOne(User, {
        where: { id: office?.user?.id },
      });
      if (!user) throw new NotFoundException('User not found');

      Object.assign(office, updateOfficeStatusDto);
      await queryRunner.manager.save(office);
      if (updateOfficeStatusDto.status === EnumStatus.Accepted) {
        await this.notificationService.notifyUser(queryRunner, office?.user?.id, "We have accepted your office request.", "Office Creation")
        user.role = Role.OFFICEMANAGER;
        await queryRunner.manager.save(User, user);
      } else {
        await this.notificationService.notifyUser(queryRunner, office?.user?.id, "We have rejected your office request because there are some fake information.", "Office Creation")
      }

      await queryRunner.commitTransaction();


      return office;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete office and its license photo from cloudinary
   */
  async remove(officeId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // const office = await this.officeRepository.findOne({
      //   where: { id },
      //   relations: ['license_photo', 'office_photo'],
      // });

      const office = await this.officeRepository
        .createQueryBuilder('office')
        .leftJoinAndSelect('office.office_photo', 'office_photo')
        .leftJoinAndSelect('office.user', 'user')
        .leftJoinAndSelect('office.blogs', 'blogs')
        .leftJoin('office.ratings', 'rating')
        .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
        .where('office.id = :officeId', { officeId })
        .select(['office', 'office_photo', 'user'])
        .getOne();

      if (!office) throw new NotFoundException('Office not found');

      if (office.user.id !== userId) {
        throw new ForbiddenException("it's forbidden to do this!");
      }

      if (office.license_photo?.public_id) {
        await this.cloudinaryService.deleteImage(
          office.license_photo.public_id,
        );
      }
      if (office.office_photo?.public_id) {
        await this.cloudinaryService.deleteImage(office.office_photo.public_id);
      }

      await queryRunner.manager.remove(office);
      await queryRunner.commitTransaction();

      return { message: 'Office deleted successfully.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

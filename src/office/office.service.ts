
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Office, OfficeCreatingStatus } from './entities/office.entity';
import { LicensePhoto } from './entities/license_photo.entity';
import { OfficePhoto } from './entities/office_photo.entity';
import { User } from 'src/user/entities/user.entity';
import { OfficeRating } from './entities/office_rating.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { UpdateOfficeStatusDto } from './dto/update-office-status.dto';
import { PaginationDto } from 'src/common/utils/pagination.dto';
import { PaginatedResponse } from 'src/common/utils/paginated-response.interface';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(LicensePhoto)
    private readonly licensePhotoRepository: Repository<LicensePhoto>,
    @InjectRepository(OfficePhoto)
    private readonly officePhotoRepository: Repository<OfficePhoto>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OfficeRating)
    private readonly officeRatingRepository: Repository<OfficeRating>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,

  ) { }

  /**
   * Create an office request with license & office photos
   */
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

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');

      let office = await this.officeRepository.findOne({
        where: {
          user,
        },
      });

      if (office) {
        throw new BadRequestException("you can't have multiple offices");
      }

      const saltOrRounds = Number(
              this.configService.get<number>('SALT_OR_ROUND', 10),
            );
      user.password = await bcrypt.hash(createOfficeDto.password, saltOrRounds);
      
      user.receiver_identifier = createOfficeDto.receiver_identifier;

      const uploadedLicense =
        await this.cloudinaryService.uploadImage(license_photo);
      const uploadedOffice =
        await this.cloudinaryService.uploadImage(office_photo);

      const licensePhoto = this.licensePhotoRepository.create({
        url: uploadedLicense.secure_url,
        public_id: uploadedLicense.public_id,
      });

      const officePhotoEntity = this.officePhotoRepository.create({
        url: uploadedOffice.secure_url,
        public_id: uploadedOffice.public_id,
      });

      await queryRunner.manager.save(licensePhoto);
      await queryRunner.manager.save(officePhotoEntity);

      office = this.officeRepository.create({
        ...createOfficeDto,
        user,
        license_photo: licensePhoto,
        office_photo: officePhotoEntity,
      });

      await queryRunner.manager.save(office);
      await queryRunner.manager.save(user);

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

  // async getAllOfficesWithAverageRating() {
  //   const offices = await this.officeRepository
  //     .createQueryBuilder('office')
  //     .leftJoinAndSelect('office.office_photo', 'office_photo')
  //     .leftJoinAndSelect('office.blogs', 'blogs')
  //     .leftJoin('office.ratings', 'rating').andWhere('status == accepted')
  //     .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
  //     .select([
  //       'office',
  //       'office_photo',
  //       // 'blogs',
  //     ])
  //     .getMany();

  //   return offices.map((office) => ({
  //     id: office.id,
  //     name: office.name,
  //     office_phone: office.office_phone,
  //     office_photo: office.office_photo,
  //     ratingsCount: office['ratingsCount'], // loadRelationCountAndMap
  //     blogs: office.blogs, // full blogs entities
  //   }));
  // }


  async getAllOfficesWithAverageRating(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.officeRepository
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.office_photo', 'office_photo')
      .leftJoinAndSelect('office.blogs', 'blogs')
      .leftJoin('office.ratings', 'rating')
      .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
      .where('office.status = :status', { status: 'accepted' })
      .select([
        'office.id',
        'office.name',
        'office.office_phone',
        'office.office_email',
        'office.status',
        'office_photo',
        'blogs',
      ])
      .skip(skip)
      .take(limit);

    // Get paginated data
    const [data, total] = await query.getManyAndCount();

    const offices = data.map((office) => ({
      id: office.id,
      name: office.name,
      office_phone: office.office_phone,
      office_email: office.office_email,
      status: office.status,
      office_photo: office.office_photo,
      ratingsCount: office['ratingsCount'],
      blogs: office.blogs,
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
    const office = await this.officeRepository
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.office_photo', 'office_photo')
      .leftJoinAndSelect('office.blogs', 'blogs')
      .leftJoin('office.ratings', 'rating')
      .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
      .where('office.id = :officeId', { officeId })
      .select(['office', 'office_photo', 'blogs'])
      .getOne();

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    return {
      id: office.id,
      name: office.name,
      office_phone: office.office_phone,
      office_photo: office.office_photo,
      ratingsCount: office['ratingsCount'],
      blogs: office.blogs,
    };
  }

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



  async getAllOfficesWhoAreStillNotAccepted(paginationDto: PaginationDto) {

    const { page = 1, limit = 10 } = paginationDto;
    const [data, total] = await this.officeRepository.findAndCount({
      skip: (page - 1) * limit, // ✅ apply offset
      take: limit,
      where: {
        status: OfficeCreatingStatus.pending
      },
      relations: ['user', 'license_photo']

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
      return office;
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
      });
      if (!office) throw new NotFoundException('Office not found');

      Object.assign(office, updateOfficeStatusDto);
      await queryRunner.manager.save(office);

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

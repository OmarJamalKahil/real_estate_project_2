// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateOfficeDto } from './dto/create-office.dto';
// import { UpdateOfficeDto } from './dto/update-office.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Office } from './entities/office.entity';
// import { DataSource, Repository } from 'typeorm';
// import { LicensePhoto } from './entities/license_photo.entity';
// import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
// import { UpdateOfficeStatusDto } from './dto/update-office-status.dto';
// import { User } from 'src/user/entities/user.entity';
// import { OfficeRating } from './entities/office_rating.entity';
// import { OfficePhoto } from './entities/office_photo.entity';

// @Injectable()
// export class OfficeService {

//   constructor(
//     @InjectRepository(Office)
//     private readonly officeRepository: Repository<Office>,
//     @InjectRepository(LicensePhoto)
//     private readonly licensePhotoRepository: Repository<LicensePhoto>,
//     @InjectRepository(OfficePhoto)
//     private readonly officePhotoRepository: Repository<OfficePhoto>,
//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,
//     @InjectRepository(OfficeRating)
//     private readonly officeRatingRepository: Repository<OfficeRating>,
//     private readonly cloudinaryService: CloudinaryService,
//     private readonly dataSource: DataSource,
//   ) { }

//   async create(createOfficeDto: CreateOfficeDto, license_photo: Express.Multer.File, office_photo: Express.Multer.File, userId: string) {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       // Upload to cloudinary
//       const uploadedLicensePhoto = await this.cloudinaryService.uploadImage(license_photo);

//       const uploadedOfficePhoto = await this.cloudinaryService.uploadImage(office_photo);

//       const user = await this.userRepository.findOne({
//         where: { id: userId }
//       })

//       if (!user) {
//         throw new NotFoundException("Not Found")
//       }

//       // Create LicensePhoto
//       const licensePhoto = this.licensePhotoRepository.create({
//         url: uploadedLicensePhoto.secure_url,
//         public_id: uploadedLicensePhoto.public_id,
//       });

//       // Create OfficePhoto
//       const officePhoto = this.licensePhotoRepository.create({
//         url: uploadedOfficePhoto.secure_url,
//         public_id: uploadedOfficePhoto.public_id,
//       });

//       await queryRunner.manager.save(licensePhoto);
//       await queryRunner.manager.save(officePhoto);

//       // Create Office entity
//       const office = this.officeRepository.create({
//         name: createOfficeDto.name,
//         personal_identity_number: createOfficeDto.personal_identity_number,
//         license_number: createOfficeDto.license_number,
//         license_photo: licensePhoto,
//         office_photo: officePhoto,
//         user: user,
//       });

//       await queryRunner.manager.save(office);

//       await queryRunner.commitTransaction();
//       return {
//         message: "We are gonna see your office creation request and then decided."
//       };

//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw error;
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async getAllOfficesWithAverageRating() {
//     return this.officeRepository
//       .createQueryBuilder('office')
//       // .leftJoinAndSelect('office.license_photo', 'license_photo')
//       // .leftJoinAndSelect('office.officeSubscription', 'officeSubscription')
//       .leftJoinAndSelect('office.user', 'user')
//       // .leftJoinAndSelect('office.blogs', 'blogs')
//       //.leftJoinAndSelect('office.ratings', 'ratings')
//       // .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
//       .loadRelationCountAndMap('office.ratings', 'office.ratings')
//       .addSelect((subQuery) => {
//         return subQuery
//           .select('AVG(rating.rating)', 'avg')
//           .from(OfficeRating, 'rating')
//           .where('rating.officeId = office.id');
//       }, 'averageRating')
//       .getMany();



//     // const offices = await this.officeRepository.find({
//     //   relations: [
//     //     'license_photo',
//     //     'officeSubscription',
//     //     'user',
//     //     'blogs',
//     //     'ratings',
//     //   ],
//     // });

//     // return offices.map((office) => {
//     //   const ratings = office.ratings || [];
//     //   const averageRating =
//     //     ratings.length > 0
//     //       ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
//     //       : 0;
//     //   return {
//     //     ...office,
//     //     averageRating,
//     //   };
//     // });



//   }




//   async findOne(id: string) {
//     return this.officeRepository.findOne({
//       where: { id },
//       relations: ['user', 'blogs'],
//     });
//   }


//   async update(id: string, updateOfficeDto: UpdateOfficeDto, license_photo?: Express.Multer.File) {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const office = await this.officeRepository.findOne({
//         where: { id },
//         relations: ['license_photo'],
//       });

//       if (!office) {
//         throw new NotFoundException('Office not found');
//       }

//       // If new photo uploaded, update the photo
//       if (license_photo) {
//         // Delete old photo from Cloudinary
//         if (office.license_photo?.public_id) {
//           await this.cloudinaryService.deleteImage(office.license_photo.public_id);
//         }

//         const uploadedImage = await this.cloudinaryService.uploadImage(license_photo);

//         office.license_photo.url = uploadedImage.secure_url;
//         office.license_photo.public_id = uploadedImage.public_id;
//         await queryRunner.manager.save(office.license_photo);
//       }

//       // Update other fields
//       Object.assign(office, updateOfficeDto);
//       await queryRunner.manager.save(office);

//       await queryRunner.commitTransaction();
//       return office;

//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw error;
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async updatingStatus(id: string, updateOfficeStatusDto: UpdateOfficeStatusDto) {

//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const office = await this.officeRepository.findOne({
//         where: { id },
//         relations: ['license_photo'],
//       });

//       if (!office) {
//         throw new NotFoundException('Office not found');
//       }

//       // Update other fields
//       Object.assign(office, updateOfficeStatusDto);
//       await queryRunner.manager.save(office);

//       await queryRunner.commitTransaction();
//       return office;

//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw error;
//     } finally {
//       await queryRunner.release();
//     }


//   }

//   async remove(id: string) {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const office = await this.officeRepository.findOne({
//         where: { id },
//         relations: ['license_photo'],
//       });

//       if (!office) {
//         throw new NotFoundException('Office not found');
//       }

//       if (office.license_photo?.public_id) {
//         await this.cloudinaryService.deleteImage(office.license_photo.public_id);
//       }

//       await queryRunner.manager.remove(office);
//       await queryRunner.commitTransaction();
//       return { message: 'Office deleted successfully' };

//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw error;
//     } finally {
//       await queryRunner.release();
//     }
//   }

// }







import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Office } from './entities/office.entity';
import { LicensePhoto } from './entities/license_photo.entity';
import { OfficePhoto } from './entities/office_photo.entity';
import { User } from 'src/user/entities/user.entity';
import { OfficeRating } from './entities/office_rating.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import { UpdateOfficeStatusDto } from './dto/update-office-status.dto';

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
  ) {}

  /**
   * Create an office request with license & office photos
   */
  async create(
    createOfficeDto: CreateOfficeDto,
    license_photo: Express.Multer.File,
    office_photo: Express.Multer.File,
    userId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');

      const uploadedLicense = await this.cloudinaryService.uploadImage(license_photo);
      const uploadedOffice = await this.cloudinaryService.uploadImage(office_photo);

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

      const office = this.officeRepository.create({
        ...createOfficeDto,
        user,
        license_photo: licensePhoto,
        office_photo: officePhotoEntity,
      });

      await queryRunner.manager.save(office);
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
  async getAllOfficesWithAverageRating() {
    return this.officeRepository
      .createQueryBuilder('office')
      .leftJoinAndSelect('office.license_photo', 'license_photo')
      .leftJoinAndSelect('office.office_photo', 'office_photo')
      .leftJoinAndSelect('office.user', 'user')
      .leftJoinAndSelect('office.officeSubscription', 'officeSubscription')
      .leftJoinAndSelect('office.blogs', 'blogs')
      .loadRelationCountAndMap('office.ratingsCount', 'office.ratings')
      .addSelect((subQuery) =>
        subQuery
          .select('AVG(rating.rating)', 'avg')
          .from(OfficeRating, 'rating')
          .where('rating.officeId = office.id')
      , 'averageRating')
      .getMany();
  }

  /**
   * Get single office by id with ratings
   */
  async findOne(id: string) {
    const office = await this.officeRepository.findOne({
      where: { id },
      relations: [
        'user',
        'officeSubscription',
        'license_photo',
        'office_photo',
        'blogs',
        'ratings',
      ],
    });

    if (!office) throw new NotFoundException('Office not found');

    const average = await this.officeRatingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'avg')
      .where('rating.officeId = :id', { id })
      .getRawOne();

    return {
      ...office,
      averageRating: Number(average?.avg) || 0,
    };
  }

  /**
   * Update office information (and optionally license photo)
   */
  async update(
    id: string,
    updateOfficeDto: UpdateOfficeDto,
    userId:string,
    office_photo?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await this.officeRepository.findOne({
        where: { id },
        relations: ['office_photo'],
      });

      if (!office) throw new NotFoundException('Office not found');
      
      if(office.user.id !== userId){
        throw new ForbiddenException("it's forbidden to do this!")
      }

      if (office_photo) {
        if (office.office_photo?.public_id) {
          await this.cloudinaryService.deleteImage(office.office_photo.public_id);
        }
        const uploaded = await this.cloudinaryService.uploadImage(office_photo);
        office.office_photo.url = uploaded.secure_url;
        office.office_photo.public_id = uploaded.public_id;
        await queryRunner.manager.save(office.office_photo);
      }

      Object.assign(office, updateOfficeDto);
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
  async updatingStatus(id: string, updateOfficeStatusDto: UpdateOfficeStatusDto) {
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
  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const office = await this.officeRepository.findOne({
        where: { id },
        relations: ['license_photo', 'office_photo'],
      });
      if (!office) throw new NotFoundException('Office not found');

      if (office.license_photo?.public_id) {
        await this.cloudinaryService.deleteImage(office.license_photo.public_id);
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

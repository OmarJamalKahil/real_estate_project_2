// import {
//     Injectable,
//     NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { ConfigService } from '@nestjs/config';
// import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

// import { User } from '../entities/user.entity';
// import { Upload } from '../entities/upload.entity';
// import { CompleteUserDto } from '../dto/complete-user.dto';
// import { USER_ERRORS } from '../user.constants';
// import { UpdateUserDto } from '../dto/update-user.dto';

// @Injectable()
// export class UserProfileService {
//     constructor(
//         @InjectRepository(User)
//         private readonly userRepository: Repository<User>,

//         @InjectRepository(Upload)
//         private readonly uploadRepository: Repository<Upload>,

//         private readonly configService: ConfigService,
//         private readonly cloudinaryService: CloudinaryService,
//     ) { }

//     /**
//      * Complete user profile after verification
//      */
//     async completeProfile(
//         userId: string,
//         dto: CompleteUserDto,
//         file?: Express.Multer.File,
//     ) {
//         const user = await this.userRepository.findOneBy({
//             id: userId,
//             is_verified: true,
//         });

//         if (!user) {
//             throw new NotFoundException(USER_ERRORS.USER_NOT_VERIFIED);
//         }

//         user.first_name = dto.first_name;
//         user.last_name = dto.last_name;
//         user.receiver_identifier = dto.receiver_identifier;

//         const saltOrRounds = Number(this.configService.get<number>('SALT_OR_ROUND', 10));
//         user.password = await bcrypt.hash(dto.password, saltOrRounds);

//         if (file) {
//             const { public_id, url } = await this.cloudinaryService.uploadImage(file);

//             const upload = this.uploadRepository.create({
//                 url,
//                 public_id,
//             });

//             await this.uploadRepository.save(upload);

//             user.profile_photo = upload;
//         }

//         await this.userRepository.save(user);

//         return { message: 'User profile completed successfully' };
//     }



//     async updateUserProfile(
//         userId: string,
//         dto: UpdateUserDto,
//         file: Express.Multer.File
//     ) {


//         let user = await this.userRepository.findOneBy({ id: userId })

//         if (!user) {
//             throw new NotFoundException(USER_ERRORS.USER_NOT_VERIFIED);
//         }

//         user.first_name = dto.first_name;
//         user.last_name = dto.last_name;
//         user.receiver_identifier = dto.receiver_identifier;


//         if (file) {
//             const { public_id, url } = await this.cloudinaryService.uploadImage(file);

//             const upload = this.uploadRepository.create({
//                 url,
//                 public_id,
//             });

//             await this.uploadRepository.save(upload);

//             user.profile_photo = upload;
//         }

//         await this.userRepository.save(user);


//         return {
//             message:"User Profile updated successfully"
//         }


//     }
// }




import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { User } from '../entities/user.entity';
import { Upload } from '../entities/upload.entity';
import { CompleteUserDto } from '../dto/complete-user.dto';
import { USER_ERRORS } from '../user.constants';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,

    private readonly configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource, // inject DataSource for transactions
  ) { }

  /**
   * Complete user profile after verification
   */
  async completeProfile(
    userId: string,
    dto: CompleteUserDto,
    file?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId, is_verified: true },
      });

      if (!user) {
        throw new NotFoundException(USER_ERRORS.USER_NOT_VERIFIED);
      }

      user.first_name = dto.first_name;
      user.last_name = dto.last_name;
      user.receiver_identifier = dto.receiver_identifier;

      const saltOrRounds = Number(
        this.configService.get<number>('SALT_OR_ROUND', 10),
      );
      user.password = await bcrypt.hash(dto.password, saltOrRounds);

      if (file) {
        // upload to cloudinary outside the transaction
        const { public_id, url } = await this.cloudinaryService.uploadImage(file);

        const upload = this.uploadRepository.create({
          url,
          public_id,
        });

        await queryRunner.manager.save(Upload, upload);

        user.profile_photo = upload;
      }

      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();

      return { message: 'User profile completed successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update user profile after verification
   */
  async updateUserProfile(
    userId: string,
    dto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(USER_ERRORS.USER_NOT_VERIFIED);
      }

      if (dto.first_name) {
        user.first_name = dto.first_name;
      }
      if (dto.last_name) {
        user.last_name = dto.last_name;
      }
      if (dto.receiver_identifier) {
        user.receiver_identifier = dto.receiver_identifier;
      }

      if (file) {
        // upload to cloudinary outside the transaction

        if (user.profile_photo) {
          await this.cloudinaryService.deleteImage(user.profile_photo.public_id)

          await this.uploadRepository.delete({ id: user.profile_photo.id })
        }

        const { public_id, url } = await this.cloudinaryService.uploadImage(file);

        const upload = this.uploadRepository.create({
          url,
          public_id,
        });

        await queryRunner.manager.save(Upload, upload);

        user.profile_photo = upload;
      }

      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();

      return { message: 'User Profile has been updated successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

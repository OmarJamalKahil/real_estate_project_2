


import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Upload } from '../entities/upload.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { USER_ERRORS } from '../user.constants';
import { CreateAdminDto } from '../dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { BanUserDto } from '../dto/ban-user.dto';
import { Banned } from '../entities/banned.entity';
import { WarnUserDto } from '../dto/warn-user.dto';
import { Warning } from '../entities/warning.entity';
import { UserWarnings } from '../entities/user-warnings.entity';

@Injectable()
export class UserAdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
        @InjectRepository(Upload)
        private readonly uploadRepository: Repository<Upload>,
        @InjectRepository(Banned)
        private readonly bannedRepository: Repository<Banned>,
        private readonly cloudinaryService: CloudinaryService,
        private readonly dataSource: DataSource,
    ) { }

    async addNewAdmin(dto: CreateAdminDto, file: Express.Multer.File) {
        let uploadPublicId: string | null = null;

        // STEP 1: upload to cloudinary first (outside transaction)
        let uploadResult: { url: string; public_id: string } | undefined;
        if (file) {
            uploadResult = await this.cloudinaryService.uploadImage(file);
            uploadPublicId = uploadResult.public_id;
        }

        // STEP 2: start transaction with QueryRunner
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userRepository = queryRunner.manager.getRepository(User);
            const uploadRepository = queryRunner.manager.getRepository(Upload);

            const existingUser = await userRepository.findOne({
                where: [
                    { phone: dto.phone },
                    { email: dto.email },
                ],
            });

            if (existingUser) {
                throw new BadRequestException(USER_ERRORS.EMAIL_PHONE_REGISTERED);
            }

            const user = userRepository.create({
                first_name: dto.first_name,
                last_name: dto.last_name,
                email: dto.email,
                phone: dto.phone,
                is_verified: false,
                role: Role.ADMIN,
            });

            const rounds = Number(this.configService.get<number>('SALT_OR_ROUND', 10));
            user.password = await bcrypt.hash(dto.password, rounds);

            if (uploadResult) {
                const upload = uploadRepository.create({
                    url: uploadResult.url,
                    public_id: uploadResult.public_id,
                });
                await uploadRepository.save(upload);
                user.profile_photo = upload;
            }

            await userRepository.save(user);

            // commit transaction
            await queryRunner.commitTransaction();

            return {
                message: `${dto.first_name} ${dto.last_name} has been created successfully.`,
            };
        } catch (error) {
            // rollback transaction
            await queryRunner.rollbackTransaction();

            // clean up uploaded file if needed
            if (uploadPublicId) {
                await this.cloudinaryService.deleteImage(uploadPublicId);
            }

            throw error;
        } finally {
            await queryRunner.release();
        }
    }



    async getAllUsers() {
        const users = await this.userRepository.findBy({
            role: In(["user", "officeManager"])
        });
        return users;
    }



    async banUser(userId: string, banUserDto: BanUserDto) {

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userRepository = queryRunner.manager.getRepository(User);
            const bannedRepository = queryRunner.manager.getRepository(Banned);

            const user = await userRepository.findOneBy({ id: userId });

            if (!user) {
                throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
            }

            const banned = bannedRepository.create({
                reason: banUserDto.reason,
                date: new Date()
            });

            user.banned = banned;

            await bannedRepository.save(banned);
            await userRepository.save(user);

            await queryRunner.commitTransaction();

            return {
                message: 'User has been banned successfully.',
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }



    async warnUser(userId: string, warnUserDto: WarnUserDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userRepository = queryRunner.manager.getRepository(User);
            const warningRepository = queryRunner.manager.getRepository(Warning);
            const userWarningsRepository = queryRunner.manager.getRepository(UserWarnings);

            // 1. Fetch user
            const user = await userRepository.findOne({
                where: { id: userId },
                relations: ['userWarnings'],
            });

            if (!user) {
                throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
            }

            // 2. Get or create UserWarnings for the user
            let userWarnings = user.userWarnings;
            if (!userWarnings) {
                userWarnings = userWarningsRepository.create({
                    report_counts: 1,
                    user: user,
                });
                await userWarningsRepository.save(userWarnings);
                user.userWarnings = userWarnings;
            } else {
                userWarnings.report_counts = userWarnings.report_counts + 1;
                await userWarningsRepository.save(userWarnings);
                user.userWarnings = userWarnings;
            }

            // 3. Create a new warning
            const warnEndTime = new Date();
            warnEndTime.setHours(warnEndTime.getHours() + 12);

            const warning = warningRepository.create({
                reason: warnUserDto.reason,
                warn_end_time: warnEndTime,
                userWarnings: userWarnings,
            });

            // 4. Save warning and updated user/userWarnings
            await warningRepository.save(warning);
            await userRepository.save(user);

            await queryRunner.commitTransaction();

            return { message: 'User has been warned successfully.' };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }


}

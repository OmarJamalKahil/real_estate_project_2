import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';

import { User, Role } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { ResetUserPassword } from '../dto/reset-user-password.dto';

import { generate6DigitCode } from '../../common/utils/generate-code';
import { USER_ERRORS } from '../user.constants';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UserAuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Register user and send verification code
     */
    async startRegister(dto: CreateUserDto, role: Role = Role.USER) {
        const code = generate6DigitCode();

        const existingUser = await this.userRepository.findOne({
            where: [{ phone: dto.phone }, { email: dto.email }],
        });

        if (existingUser) {
            throw new BadRequestException(USER_ERRORS.EMAIL_PHONE_REGISTERED);
        }

        const user = this.userRepository.create({
            email: dto.email,
            phone: dto.phone,
            verify_code: code,
            is_verified: false,
            role,
        });

        await this.userRepository.save(user);

        await this.mailService.sendMail(dto.email, code);

        const tokens = this.authService.generateTokens({
            userId: user.id,
            role: user.role,
        });

        return {
            message: 'Verification code sent',
            ...tokens,
        };
    }

    /**
     * Verify the sent code
     */
    async verifyCode(userId: string, verify_code: string) {
        const user = await this.userRepository.findOneBy({
            id: userId,
            verify_code,
        });

        if (!user) {
            throw new NotFoundException(USER_ERRORS.INVALID_VERIFICATION);
        }

        user.is_verified = true;
        await this.userRepository.save(user);

        return { message: 'User verified successfully' };
    }

    /**
     * Login
     */
    async login(dto: LoginUserDto) {
        const user = await this.userRepository.findOneBy({
            email: dto.email,
            is_verified: true
        });

        if (!user) {
            throw new UnauthorizedException(USER_ERRORS.INVALID_CREDENTIALS);
        }

        const match = await bcrypt.compare(dto.password, user.password);

        if (!match) {
            throw new UnauthorizedException(USER_ERRORS.INVALID_CREDENTIALS);
        }

        const tokens = this.authService.generateTokens({
            userId: user.id,
            role: user.role,
        });

        return { ...tokens, role: user.role };
    }

    async getUser(userId: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile_photo'],
        });

        if (!user) {
            throw new UnauthorizedException(USER_ERRORS.INVALID_CREDENTIALS);
        }

        // map only safe fields to the DTO
        const UserResponse: UserResponseDto = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            profile_photo: user.profile_photo,
            receiver_identifier:user.receiver_identifier,
            phone: user.phone,
            email: user.email,
            user_role: user.role
        };

        return UserResponse;
    }


    /**
     * Reset password - send code
     */
    async resetPassword(userId: string) {
        const user = await this.userRepository.findOneBy({
            id: userId,
            is_verified: true,
        });

        if (!user) {
            throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
        }

        const code = generate6DigitCode();
        user.verify_code = code;
        user.is_verified = false;

        await this.userRepository.save(user);
        await this.mailService.sendMail(user.email, code);

        return {
            message: 'Verification code sent',
        };
    }

    /**
     * Edit password after code verified
     */
    async editPassword(userId: string, new_password: string) {
        const user = await this.userRepository.findOneBy({
            id: userId,
            is_verified: true,
        });

        if (!user) {
            throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
        }

        const rounds = Number(this.configService.get<number>('SALT_OR_ROUND', 10));
        user.password = await bcrypt.hash(new_password, rounds);

        await this.userRepository.save(user);

        return { message: 'Password has been reset successfully' };
    }


}

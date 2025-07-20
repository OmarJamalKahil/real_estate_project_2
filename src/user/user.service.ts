import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';

import { ConfigService } from "@nestjs/config";

import { Role, User } from "./entities/user.entity";
import { Upload } from "./entities/upload.entity";

import { CreateUserDto } from "./dto/create-user.dto";
import { VerifyUserDto } from "./dto/verify-user.dto";
import { CompleteUserDto } from "./dto/complete-user.dto";

import { AuthService } from "src/auth/auth.service";
import { MailService } from "src/mail/mail.service";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { GetUserByNationalNumberDto } from "./dto/get-user-by-national-number.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,

    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Register user and send verification code
   */
  async startRegister(dto: CreateUserDto, role: Role = Role.USER) {
    const code = this.generateCode();

    // Check if phone or email already registered
    const existingUser = await this.userRepository.findOne({
      where: [
        { phone: dto.phone },
        { email: dto.email }
      ]
    });

    if (existingUser) {
      throw new BadRequestException('Phone number or email is already registered');
    }

    const user = this.userRepository.create({
      email: dto.email,
      phone: dto.phone,
      verify_code: code,
      is_verified: false,
      role
    });

    await this.userRepository.save(user);

    await this.mailService.sendMail(dto.email, code);

    const tokens = this.authService.generateTokens({
      userId: user.id,
      role: user.role
    });

    return {
      message: 'Verification code sent',
      ...tokens,
    };
  }

  /**
   * Verify the sent code
   */
  async verifyCode(email: string, phone: string, verify_code: string) {
    const user = await this.userRepository.findOneBy({
      email,
      phone,
      verify_code,
    });

    if (!user) {
      throw new NotFoundException('Invalid code or user');
    }

    user.is_verified = true;
    await this.userRepository.save(user);

    return { message: 'User verified successfully' };
  }

  /**
   * Complete user profile after verification
   */
  async completeProfile(
    email: string,
    phone: string,
    dto: CompleteUserDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOneBy({
      email,
      phone,
      is_verified: true,
    });

    if (!user) {
      throw new NotFoundException('User not found or not verified');
    }

    user.first_name = dto.first_name;
    user.last_name = dto.last_name;
    user.national_number = dto.national_number;

    const saltOrRounds = Number(this.configService.get<number>('SALT_OR_ROUND', 10));
    user.password = await bcrypt.hash(dto.password, saltOrRounds);

    // if the user uploads a profile photo
    if (file) {
      const { public_id, url } = await this.cloudinaryService.uploadImage(file);

      const upload = this.uploadRepository.create({
        url,
        public_id,
      });

      await this.uploadRepository.save(upload);

      user.profile_photo = upload; // assuming you have relation in the entity
    }

    await this.userRepository.save(user);

    return { message: 'User profile completed successfully' };
  }


  async login(loginUserDto: LoginUserDto) {

    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },

    });

    if (!user) {
      throw new UnauthorizedException('user or password is not valid or correct')
    }

    const result = await bcrypt.compare(loginUserDto.password, user.password)

    if (!result) {
      throw new UnauthorizedException('user or password is not valid or correct')
    }

    const tokens = this.authService.generateTokens({
      userId: user.id,
      role: user.role
    });

    return {
      ...tokens
    }

  }





  async resetPassword(userId: string) {

    const user = await this.userRepository.findOneBy({
      id: userId,
      is_verified: true,
    });

    if (!user) {
      throw new NotFoundException('User not found or not verified.');
    }

    const code = this.generateCode();
    user.verify_code = code;
    user.is_verified = false;

    await this.userRepository.save(user); // don't forget to persist the new code
    await this.mailService.sendMail(user.email, code);

    return {
      message: 'Verification code sent',
    };

  }

  async editePassword(
    userId: string, newPassword: string
  ) {

    const user = await this.userRepository.findOneBy({
      id: userId,
      is_verified: true,
    });

    if (!user) {
      throw new NotFoundException('User not found or not verified');
    }

    const saltOrRounds = Number(this.configService.get<number>('SALT_OR_ROUND', 10));
    user.password = await bcrypt.hash(newPassword, saltOrRounds);

    await this.userRepository.save(user);

    return { message: 'Password has been Reseted successfully' };


  }


  async getUserByNationalNumber(getUserByNationalNumberDto: GetUserByNationalNumberDto) {
    const user = await this.userRepository.findOne({
      where: { national_number: getUserByNationalNumberDto.national_number },
      relations: ['banned', 'userWarnings']

    });

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    // map only safe fields to the DTO
    const UserResponse = {
      id: user.id,
      full_name: `${user.first_name} ${user.last_name}`,
      national_number: user.national_number,
    };

    return UserResponse;
  }

  /**
   * Generate a 6-digit verification code
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

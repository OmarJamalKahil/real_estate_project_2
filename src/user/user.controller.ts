
import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Put,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { UserAuthService } from './services/user-auth.service';
import { UserProfileService } from './services/user-profile.service';

import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { CompleteUserDto } from './dto/complete-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetUserPassword } from './dto/reset-user-password.dto';
import { Role } from './entities/user.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserAdminService } from './services/user-admin.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { WarnUserDto } from './dto/warn-user.dto';
import { GetUserByNationalNumberDto } from './dto/get-user-by-national-number.dto';
import { UserService } from './user.service';

@Controller('user')

export class UserController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly userProfileService: UserProfileService,
    private readonly userAdminService: UserAdminService,
    private readonly userService: UserService,

  ) { }

  @Get("get-all-users")
  async getAllUsers() {
    return this.userAdminService.getAllUsers()
  }



  @Post('start-register')
  async startRegister(@Body() dto: CreateUserDto) {
    return this.userAuthService.startRegister(dto);
  }



  @Post('verify-code')
  @UseGuards(JwtAuthGuard)
  async verifyCode(@Req() req, @Body() dto: VerifyUserDto) {
    const { userId } = req.user;
    return this.userAuthService.verifyCode(userId, dto.verify_code);
  }

  @Post('complete-register')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profile_photo'))
  async complete(
    @Req() req,
    @Body() dto: CompleteUserDto,
    @UploadedFile() profile_photo: Express.Multer.File,
  ) {
    const { userId } = req.user;
    return this.userProfileService.completeProfile(userId, dto, profile_photo);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userAuthService.login(loginUserDto);
  }

  @Get('get-current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @Req() req
  ) {
    const { userId } = req.user;
    console.log("this is something");

    return this.userAuthService.getUser(userId);
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(
    @Param('id') id: string
  ) {
    return this.userService.getUserById(id);
  }

  @Get('get-user-national-number/:national_number')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OFFICEMANAGER)
  async getUserByNationalNumber(
    @Param() getUserByNationalNumberDto: GetUserByNationalNumberDto
  ) {
    return this.userService.getUserByNationalNumber(getUserByNationalNumberDto);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  async resetPassword(@Req() req) {
    const { userId } = req.user;
    return this.userAuthService.resetPassword(userId);
  }

  @Post('edite-password')
  @UseGuards(JwtAuthGuard)
  async editPassword(@Req() req, @Body() dto: ResetUserPassword) {
    const { userId } = req.user;
    return this.userAuthService.editPassword(userId, dto.new_password);
  }


  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.SUPERADMIN)
  // @UseInterceptors(FileInterceptor('profile_photo'))
  // @Post('add-admin')
  // async addingNewAdmin(
  //   createAdminDto:CreateAdminDto,
  //   @UploadedFile() profilePhoto: Express.Multer.File,

  // ) {
  //   console.log("createAdminDto",createAdminDto);

  //  return await this.userAdminService.addNewAdmin(createAdminDto,profilePhoto)
  // }

  @Post('add-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @UseInterceptors(FileInterceptor('profile_photo'))
  async addingNewAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() profilePhoto: Express.Multer.File,
  ) {
    return this.userAdminService.addNewAdmin(createAdminDto, profilePhoto);
  }


  @Put("update-profile")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profile_photo'))
  async updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profilePhoto?: Express.Multer.File,
  ) {

    const { userId } = req.user;
    return await this.userProfileService.updateUserProfile(userId, updateUserDto, profilePhoto)
  }

  @Post('ban-user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async banUser(
    @Param('userId') userId: string,
    @Body() banUserDto: BanUserDto
  ) {
    return await this.userAdminService.banUser(userId, banUserDto)
  }

  @Post('warn-user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  async warnUser(
    @Param('userId') userId: string,
    @Body() warnUserDto: WarnUserDto
  ) {
    return await this.userAdminService.warnUser(userId, warnUserDto)
  }


}

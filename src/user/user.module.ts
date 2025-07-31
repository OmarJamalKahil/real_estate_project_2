import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Banned } from './entities/banned.entity';
import { Warning } from './entities/warning.entity';
import { Upload } from './entities/upload.entity';
import { MailModule } from 'src/mail/mail.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserAuthService } from './services/user-auth.service';
import { UserProfileService } from './services/user-profile.service';
import { UserAdminService } from './services/user-admin.service';
import { UserWarnings } from './entities/user-warnings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Upload, Banned, Warning, UserWarnings,]),
    AuthModule, // ✅ this fixes the issue
    MailModule,
    CloudinaryModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserAuthService,
    UserProfileService,
    UserAdminService
  ],
  exports: [
    UserService,
    UserAuthService,
    UserProfileService,
    UserAdminService
  ]
})
export class UserModule { }

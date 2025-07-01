import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import * as Joi from 'joi'
import { MailService } from './mail/mail.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { User } from './user/entities/user.entity';
import { Upload } from './user/entities/upload.entity';
import { Warning } from './user/entities/warning.entity';
import { Banned } from './user/entities/banned.entity';
import { UserWarnings } from './user/entities/user-warnings.entity';
import { OfficeModule } from './office/office.module';
import { BlogModule } from './blog/blog.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { Office } from './office/entities/office.entity';
import { OfficeSubscription } from './office/entities/office_subscription.entity';
import { Subscription } from './subscription/entities/subscription.entity';
import { Blog } from './blog/entities/blog.entity';
import { BlogMedia } from './blog/entities/blog_media.entity';
import { LicensePhoto } from './office/entities/license_photo.entity';
import { OfficeRating } from './office/entities/office_rating.entity';
import { OfficePhoto } from './office/entities/office_photo.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Upload,
      Banned,
      Warning,
      UserWarnings,
      Office,
      OfficeSubscription,
      Subscription,
      Blog,
      BlogMedia,
      OfficeRating,
      
    ]), 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      //  process.env.DB_HOST,
      port: 5432,
      // Number(process.env.DB_PORT),
      username: 'postgres',
      // process.env.DB_USER_NAME,
      password: "0940468172mtn",
      //  process.env.DB_PASSWORD || 
      database: 'real-estate',
      // process.env.DB_NAME,
      entities: [
        User, 
        Upload, 
        Warning, 
        UserWarnings,
        Banned, 
        LicensePhoto, 
        Subscription,
        Blog, 
        Office, 
        OfficeSubscription, 
        OfficeRating,
        OfficePhoto,
      ],
      // autoLoadEntities: true, // Automatically loads entities registered through TypeOrmModule.forFeature()
      synchronize: true,      // ⚠️ use only in development
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        // Cloudinary
        CLOUDINARY_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_SECRET_KEY: Joi.string().required(),
 
        // Auth
        ACCESS_SECRET_KEY: Joi.string().required(),
        ACCESS_EXPIRE_IN: Joi.string().required(),

        REFRESH_SECRET_KEY: Joi.string().required(),
        REFRESH_EXPIRE_IN: Joi.string().required(),


        // DataBase
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USER_NAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_TYPE: Joi.string().required(),



      }),
    }),
    UserModule,
    AuthModule,
    MailModule,
    CloudinaryModule,
    OfficeModule,
    SubscriptionModule,
    BlogModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {

}

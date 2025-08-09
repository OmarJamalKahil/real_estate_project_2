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
import { Subscription } from './subscription/entities/subscription.entity';
import { Blog } from './blog/entities/blog.entity';
import { BlogMedia } from './blog/entities/blog_media.entity';
import { LicensePhoto } from './office/entities/license_photo.entity';
import { OfficeRating } from './office/entities/office_rating.entity';
import { OfficePhoto } from './office/entities/office_photo.entity';
import { PropertyModule } from './property/property.module';
import { Location } from './property/entities/location.entity';
import { LicenseDetails } from './property/entities/license_details.entity';
import { PropertyTypeAttribute } from './property/entities/propertyType_attribute.entity';
import { PropertyAttribute } from './property/entities/property_attribute.entity';
import { PropertyPhotos } from './property/entities/property_photos.entity';
import { Property } from './property/entities/property.entity';
import { OfficeSubscriptionModule } from './office-subscription/office-subscription.module';
import { OfficeSubscription } from './office-subscription/entities/office-subscription.entity';
import { PaymentCardModule } from './payment-card/payment-card.module';
import { PaymentCard } from './payment-card/entities/payment-card.entity';
import { OfficeCommentModule } from './office-comment/office-comment.module';
import { OfficeComment } from './office-comment/entities/office-comment.entity';
import { FavoriteOfficeModule } from './favorite-office/favorite-office.module';
import { FavoriteOffice } from './favorite-office/entities/favorite-office.entity';
import { PropertyCommentModule } from './property-comment/property-comment.module';
import { PropertyComment } from './property-comment/entities/property-comment.entity';
import { FavoritePropertyModule } from './favorite-property/favorite-property.module';
import { FavoriteProperty } from './favorite-property/entities/favorite-property.entity';
import { PropertyTypeModule } from './property-type/property-type.module';
import { AttributeModule } from './attribute/attribute.module';
import { PropertyType } from './property-type/entities/property-type.entity';
import { Attribute } from './attribute/entities/attribute.entity';
import { ReservationModule } from './reservation/reservation.module';
import { CronModule } from './cron/cron.module';
import { Reservation } from './reservation/entities/reservation.entity';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Notification } from './notification/entities/notification.entity';
import { StatisticsModule } from './statistics/statistics.module';
import { ArchiveModule } from './archive/archive.module';
import { Archive } from './archive/entities/archive.entity';
import { Owner } from './archive/entities/owner.entity';
import { Client } from './archive/entities/client.entity';
import { EarningStatistics } from './statistics/entities/earning_statistics.entity';
import { GeneralStatistics } from './statistics/entities/general_statistics.entity';
import { FinancialStatistics } from './statistics/entities/financial_statistics.entity';
import { Photo } from './common/entities/Photo.entity';
import { RentalExpirationDate } from './property-request/entities/rental-expiration-date.entity';
import { PropertyRequestPhoto } from './property-request/entities/property-request-photo.entity';
import { PropertyRequest } from './property-request/entities/property-request.entity';
import { LicenseTypeModule } from './license-type/license-type.module';
import { PropertyRequestModule } from './property-request/property-request.module';
import { LicenseType } from './license-type/entities/license_type.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Photo,
      Banned,
      Warning,
      UserWarnings,
      Office,
      Subscription,
      Blog,
      BlogMedia,
      OfficeRating,
      PaymentCard,
      OfficeComment,
      FavoriteOffice,
      PropertyComment,
      FavoriteProperty,
      Reservation,
      Notification

    ]),
    ScheduleModule.forRoot(), 
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
        Warning,
        UserWarnings,
        Banned,
        LicensePhoto,
        Subscription,
        Blog,
        BlogMedia,
        Office,
        OfficeRating,
        Photo,
        OfficeSubscription,
        Property,
        PropertyPhotos,
        PropertyAttribute,
        Attribute,
        PropertyType,
        PropertyTypeAttribute,
        LicenseDetails,
        LicenseType,
        Location,
        PaymentCard,
        OfficeComment,
        FavoriteOffice,
        PropertyComment,
        FavoriteProperty,
        Reservation,
        Notification,
        PropertyRequest,
        PropertyRequestPhoto,
        RentalExpirationDate,
        Archive,
        Owner,
        Client,
        EarningStatistics,
        GeneralStatistics,
        FinancialStatistics
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

        // CardSystem
        CARD_CVV: Joi.string().required(),
        CARD_NUMBER: Joi.string().required(),
        CARD_EXPIRY_MONTH: Joi.number().required(),
        CARD_EXPIRE_YEAR: Joi.number().required(),
        CARD_TYPE: Joi.string().required(),


      }),
    }),
    UserModule,
    AuthModule,
    MailModule,
    CloudinaryModule,
    OfficeModule,
    SubscriptionModule,
    BlogModule,
    PropertyModule,
    OfficeSubscriptionModule,
    PaymentCardModule,
    OfficeCommentModule,
    FavoriteOfficeModule,
    PropertyCommentModule,
    FavoritePropertyModule,
    PropertyTypeModule,
    AttributeModule,
    ReservationModule,
    NotificationModule,
    CronModule,
    PropertyRequestModule,
    LicenseTypeModule,
    StatisticsModule,
    ArchiveModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {

}

// klfdskldflklkdfskfdslkkldfsdfskl
// klfdskldflklkdfskfdslkkldfsdfskl
// klfdskldflklkdfskfdslkkldfsdfskl


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
import { PropertyModule } from './property/property.module';
import { Location } from './property/entities/location.entity';
import { LicenseType } from './license-type/entities/license_type.entity';
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
import { PropertyRequestModule } from './property-request/property-request.module';
import { Photo } from './common/entities/Photo.entity';
import { PropertyRequest } from './property-request/entities/property-request.entity';
import { PropertyRequestPhoto } from './property-request/entities/property-request-photo.entity';
import { RentalExpirationDate } from './property-request/entities/rental-expiration-date.entity';
import { LicenseTypeModule } from './license-type/license-type.module';
// import { CookieResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { SubscriptionStatistics } from './statistics/entities/subscription-statistics.entity';
import { PropertyStatistics } from './statistics/entities/property-statistics.entity';
import { generalStatistics } from './statistics/entities/general-statistics.entity';
import { OfficeComplaint } from './office-complaint/entities/office-complaint.entity';
import { OfficeComplaintPhoto } from './office-complaint/entities/office-complaint-photo.entity';
import { PropertyComplaint } from './property-complaint/entities/property-complaint.entity';
import { PropertyComplaintPhoto } from './property-complaint/entities/property-complaint-photo.entity';
import { OfficeComplaintModule } from './office-complaint/office-complaint.module';
import { PropertyComplaintModule } from './property-complaint/property-complaint.module';
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
      Notification,
      SubscriptionStatistics,
      PropertyStatistics,
      generalStatistics,

    ]),

    // I18nModule.forRoot({
    //   fallbackLanguage: 'en',
    //   loaderOptions: {
    //     path: path.join(__dirname, '/i18n/'),
    //     watch: true
    //   },

    //   resolvers: [
    //     // { use: QueryResolver, options: ['lang'] },
    //     // new HeaderResolver(['x-lang', 'accept-language']),
    //     // new CookieResolver(['lang']),
    //     // AcceptLanguageResolver
    //     new QueryResolver(["lang", "l"]),
    //     new HeaderResolver(["x-custom-lang"]),
    //     new CookieResolver(),
    //     AcceptLanguageResolver,
    //   ]
    // }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      //  process.env.DB_HOST,
      port: 5432,
      // Number(process.env.DB_PORT),
      username: 'postgres',
      // process.env.DB_USER_NAME,
      password: "12345678910",
      //  process.env.DB_PASSWORD || 
      database: 'realEstateDb',
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
        SubscriptionStatistics,
        PropertyStatistics,
        generalStatistics,
        OfficeComplaint,
        OfficeComplaintPhoto,
        PropertyComplaint,
        PropertyComplaintPhoto,

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

        // // Stripe 
        // STRIPE_SECRET_KEY: Joi.string().required(),
        // STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
        // STRIPE_WEBHOOK_SECRET: Joi.string().required(),



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
    OfficeComplaintModule,
    PropertyComplaintModule
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {

}

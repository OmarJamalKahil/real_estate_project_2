import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { PaymentCardModule } from 'src/payment-card/payment-card.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { PaymentCard } from 'src/payment-card/entities/payment-card.entity';
import { Property } from 'src/property/entities/property.entity';
import { PropertyService } from 'src/property/property.service';
import { PropertyModule } from 'src/property/property.module';
import { NotificationModule } from 'src/notification/notification.module';
import { StatisticsModule } from 'src/statistics/statistics.module';

@Module({
    imports:[
    TypeOrmModule.forFeature([
      Reservation,User,PaymentCard,Property
    ]),
    PaymentCardModule,
    UserModule,
    PropertyModule,
    NotificationModule,
    StatisticsModule
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}

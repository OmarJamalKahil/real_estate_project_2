import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Office } from 'src/office/entities/office.entity';
import { Property } from 'src/property/entities/property.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Reservation,Notification,Office,Property
    ])
  ],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}

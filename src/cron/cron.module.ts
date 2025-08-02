import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,Notification
    ])
  ],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}

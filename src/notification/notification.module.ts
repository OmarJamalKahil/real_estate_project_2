import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Notification
    ])
  ],
  controllers:[NotificationController],
  providers: [NotificationGateway,NotificationService],
  exports: [NotificationGateway,NotificationService], // if used in other modules
})
export class NotificationModule {}

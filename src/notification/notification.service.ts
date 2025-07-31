// // src/notifications/notifications.service.ts
// import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
// import { NotificationGateway } from './notification.gateway';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, DataSource } from 'typeorm';
// import { Notification } from './entities/notification.entity';
// import { User } from 'src/user/entities/user.entity';

// @Injectable()
// export class NotificationService {
//   constructor(
//     private readonly gateway: NotificationGateway,

//     @InjectRepository(Notification)
//     private readonly notificationRepository: Repository<Notification>,

//     @InjectRepository(User)
//     private readonly userRepository: Repository<User>,

//     private readonly dataSource: DataSource, // Needed for query runner
//   ) {}

//   async notifyUser(userId: string, message: string,title: string): Promise<void> {
//     const queryRunner = this.dataSource.createQueryRunner();

//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       // Check if user exists
//       const user = await queryRunner.manager.findOne(User, {
//         where: { id: userId },
//       });

//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       // Create the notification
//       const notification = queryRunner.manager.create(Notification, {
//         user,
//         title,
//         message,
//         isRead: false, // assuming this field exists
//         createdAt: new Date(),
//       });

//       await queryRunner.manager.save(Notification, notification);

//       // Notify user via WebSocket
//       this.gateway.notifyUser(userId, message);

//       await queryRunner.commitTransaction();
//     } catch (err) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException('Failed to send notification');
//     } finally {
//       await queryRunner.release();
//     }
//   }


//   async getAllNotificationsByUserId(userId:string){
//     const notifications = await this.notificationRepository.find({
//       where:{

//         recipient:{

//           id:userId

//         }

//       }})
//   }

//   async updateNotificationAsRead(notificationId: string){
//     const notification = await this.notificationRepository.findOne({
//       where:{
//         id:notificationId
//       }
//     })

//     if(!notification){
//       throw new NotFoundException(`Notification with this id:${notificationId} not found}`)
//     }

//     notification.isRead = true;
//     await this.notificationRepository.save(notification)


//   }

//   async deleteNotification(notificationId: string){
//     const notification = await this.notificationRepository.findOne({
//       where:{
//         id:notificationId
//       }
//     })

//   }





// }



























// src/notifications/notifications.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, QueryRunner } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly gateway: NotificationGateway,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) { }

  async notifyUser(queryRunner: QueryRunner, userId: string, message: string, title: string): Promise<void> {
    // const queryRunner = this.dataSource.createQueryRunner();

    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) throw new NotFoundException('User not found');

      const notification = queryRunner.manager.create(Notification, {
        user,
        title,
        message,
        isRead: false,
        createdAt: new Date(),
      });

      await queryRunner.manager.save(Notification, notification);

      this.gateway.notifyUser(userId, title, message);

    } catch (err) {
      throw new InternalServerErrorException('Failed to send notification');
    }

  }

  async getAllNotificationsByUserId(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return notifications;
  }

  async updateNotificationAsRead(notificationId: string) {
    const notification = await this.notificationRepository.findOne({ 
      where: { id: notificationId },
    });
 
    if (!notification) {
      throw new NotFoundException(`Notification with id ${notificationId} not found`);
    }
 
    notification.isRead = true;
    await this.notificationRepository.save(notification);

  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with id ${notificationId} not found`);
    }

    await this.notificationRepository.remove(notification);
  }

  async deleteOldNotifications() {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(threeDaysAgo),
    });

    console.log(`Deleted ${result.affected} old notifications`);
  }
}

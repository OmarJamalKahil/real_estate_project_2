import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification/notification.service';

@Injectable()
export class AppService {
  constructor(
    private readonly notificationService: NotificationService,
  ) { }



  // getHello(userId: string): string {
  //   this.notificationService.notifyUser(userId,'this is title' ,'Hello World!')
  //   return 'Hello World!';
  // }
}

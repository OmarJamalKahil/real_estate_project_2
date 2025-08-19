// src/notifications/notification.controller.ts

import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Body,
  Post,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// If you're using JWT auth, you might have this guard
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('notification')
@UseGuards(JwtAuthGuard) // Uncomment if using JWT
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }
  // 🔔 Get my notifications
  @Get('/user/me')
  async getMyNotifications(@Request() req) {
    const {userId} = req.user;
    return this.notificationService.getAllNotificationsByUserId(userId);
  }

  // 🔔 Get all notifications for a specific user
  @Get('user/:userId')
  async getAllNotifications(@Param('userId') userId: string) {
    return this.notificationService.getAllNotificationsByUserId(userId);
  }

  // 🔴 Get unread count for badge
  @Get('unread-count/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    const allNotifications = await this.notificationService.getAllNotificationsByUserId(userId);
    const count = allNotifications.filter(n => !n.isRead).length;
    return { count };
  }

  // ✅ Mark a single notification as read
  @Patch('read/:notificationId') 
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.updateNotificationAsRead(notificationId);
  } 
    @Post('notify-user')
  async notifyUser(@Body() data: any) {
    return this.notificationService.notifyUserWithoutQueryRunner(data?.userId,data?.message,data?.title);
  }

  // ✅ Mark all notifications as read for a user
  @Patch('read-all/:userId')
  async markAllAsRead(@Param('userId') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  // 🗑️ Delete a notification
  @Delete(':notificationId')
  async delete(@Param('notificationId') notificationId: string) {
    return this.notificationService.deleteNotification(notificationId);
  }



}




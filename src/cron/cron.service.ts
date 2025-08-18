// src/cron/cron.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Office } from 'src/office/entities/office.entity';
import { Property } from 'src/property/entities/property.entity';
import { EnumStatus } from 'src/property/common/property-status.enum';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,


    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,

  ) { }

  // ✅ Run both cron jobs once on app startup
  onModuleInit() {
    this.handleReservationExpiration();
    this.deleteOldNotifications();
  }

  // ✅ Cron to expire reservations every 2 hours
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleReservationExpiration(): Promise<void> {
    this.logger.log('Checking for expired reservations...');
    const now = new Date();

    const expiredReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.expires_at < :now', { now })
      .andWhere('reservation.is_expired = :isExpired', { isExpired: false })
      .getMany();

    if (expiredReservations.length > 0) {
      for (const reservation of expiredReservations) {
        reservation.is_expired = true;
      }
      await this.reservationRepository.save(expiredReservations);
      this.logger.log(`Marked ${expiredReservations.length} reservations as expired.`);
    } else {
      this.logger.log('No new expired reservations found.');
    }
  }

  // ✅ Cron to delete notifications older than 3 days (runs every day at 2 AM)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async deleteOldNotifications(): Promise<void> {
    this.logger.log('Checking for old notifications to delete...');

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const result = await this.notificationRepository.delete({
      createdAt: LessThan(threeDaysAgo),
    });

    this.logger.log(`Deleted ${result.affected} old notifications.`);
  }


  // ✅ Cron to delete  rejected offices (runs every day at 2 AM)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async deleteRejectedOffices(): Promise<void> {
    this.logger.log('Checking for rejected offices to delete...');

    const result = await this.officeRepository.delete({
      status: EnumStatus.Rejected,
    });

    this.logger.log(`Deleted ${result.affected}  rejected offices.`);
  }


  // ✅ Cron to delete  rejected properties (runs every day at 2 AM)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async deleteRejectedProperties(): Promise<void> {
    this.logger.log('Checking for rejected properties to delete...');

    const result = await this.propertyRepository.delete({
      status: EnumStatus.Rejected,
    });

    this.logger.log(`Deleted ${result.affected}  rejected properties.`);
  }


}


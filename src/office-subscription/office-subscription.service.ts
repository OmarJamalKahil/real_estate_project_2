import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOfficeSubscriptionDto } from './dto/create-office-subscription.dto';
import { UpdateOfficeSubscriptionDto } from './dto/update-office-subscription.dto';
import { OfficeSubscription } from './entities/office-subscription.entity';
import { Office } from 'src/office/entities/office.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { PaymentCardService } from 'src/payment-card/payment-card.service';
import { SubscriptionStatistics } from 'src/statistics/entities/subscription-statistics.entity';
import { GeneralStatisticsService } from 'src/statistics/services/general-statistics.service';
import { SubscriptionStatisticsService } from 'src/statistics/services/subscription-statistics.service';

@Injectable()
export class OfficeSubscriptionService {
  constructor(
    @InjectRepository(OfficeSubscription)
    private officeSubscriptionRepository: Repository<OfficeSubscription>,

    @InjectRepository(Office)
    private officeRepository: Repository<Office>,

    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,

    private readonly paymentCardService: PaymentCardService,
    private readonly generalStatisticsService: GeneralStatisticsService,
    private readonly subscriptionStatisticsService: SubscriptionStatisticsService,

    private readonly dataSource: DataSource, // Inject DataSource for transactions


  ) { }



  // async create(officeManagerId: string, createDto: CreateOfficeSubscriptionDto) {
  //   const queryRunner = this.dataSource.createQueryRunner();

  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const subscription = await queryRunner.manager.findOne(Subscription, {
  //       where: { id: createDto.subscriptionId },
  //     });

  //     const office = await queryRunner.manager.findOne(Office, {
  //       where: {
  //         user: { id: officeManagerId },
  //       },
  //       relations: ['properties', 'user'],
  //     });



  //     if (!office || !subscription) {
  //       throw new NotFoundException('Office or Subscription not found');
  //     }

  //     const officeSubscription = await queryRunner.manager.findOne(OfficeSubscription, {
  //       where: {
  //         office: {
  //           id: office.id
  //         },
  //         subscription: {
  //           id: subscription.id
  //         }
  //       },
  //     });



  //     if (officeSubscription) {
  //       await queryRunner.manager.delete(OfficeSubscription, { id: officeSubscription.id });
  //     }


  //     await this.paymentCardService.searchAndWithdraw(
  //       { ...createDto },
  //       subscription.price!,
  //       queryRunner.manager,
  //     );

  //     const newOfficeSubscription = queryRunner.manager.create(OfficeSubscription, {
  //       start_date: new Date(),
  //       end_date: this.returnTheEndDate(subscription.duration),
  //       current_number_promotions: 0,
  //       current_number_property: office.properties.length,
  //       remaining_properties: subscription.propertyNumber - office.properties.length,
  //       remaining_promotions: subscription.numberOfPromotion,
  //       office,
  //       subscription,
  //     });

  //     const savedSubscription = await queryRunner.manager.save(OfficeSubscription, newOfficeSubscription);

  //     await queryRunner.commitTransaction();
  //     return savedSubscription;
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();
  //     console.error(err);
  //     throw new InternalServerErrorException('Failed to create subscription');
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }


  async create(officeManagerId: string, createDto: CreateOfficeSubscriptionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the subscription by ID
      const subscription = await queryRunner.manager.findOne(Subscription, {
        where: { id: createDto.subscriptionId },
      });

      // Find the office by manager ID and load properties
      const office = await queryRunner.manager.findOne(Office, {
        where: { user: { id: officeManagerId } },
        relations: ['properties', 'user'],
      });

      if (!subscription || !office) {
        throw new NotFoundException('Office or Subscription not found');
      }

      await this.generalStatisticsService.createGeneralStats(queryRunner, subscription.price)
      await this.subscriptionStatisticsService.createSubscriptionStats(queryRunner, subscription.price, subscription)

      // Check if the office already has a subscription
      const existingSubscription = await queryRunner.manager.findOne(OfficeSubscription, {
        where: {
          office: { id: office.id },
        },
        relations: ['office', 'subscription'],
      });

      // Delete existing subscription if it exists
      if (existingSubscription) {
        await queryRunner.manager.delete(OfficeSubscription, { id: existingSubscription.id });
      }

      // Attempt to withdraw payment
      await this.paymentCardService.searchAndWithdraw(
        { ...createDto },
        subscription.price!,
        queryRunner.manager
      );

      // Create and save new office subscription
      const newOfficeSubscription = queryRunner.manager.create(OfficeSubscription, {
        start_date: new Date(),
        end_date: this.returnTheEndDate(subscription.duration),
        current_number_promotions: 0,
        current_number_property: office.properties.length,
        remaining_properties: subscription.propertyNumber - office.properties.length,
        remaining_promotions: subscription.numberOfPromotion,
        office,
        subscription,
      });


      const subscriptionStatistics = queryRunner.manager.create(SubscriptionStatistics, {
        amount: subscription.price,
        subscription
      });



      const saved = await queryRunner.manager.save(OfficeSubscription, newOfficeSubscription);
      await queryRunner.manager.save(subscriptionStatistics);


      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Subscription creation failed:', error);
      throw new InternalServerErrorException('Failed to create subscription');
    } finally {
      await queryRunner.release();
    }
  }


  async findAll() {
    return await this.officeSubscriptionRepository.find({
      relations: ['office', 'subscription'],
    });
  }

  async findOne(id: string) {
    const sub = await this.officeSubscriptionRepository.findOne({
      where: { id },
      relations: ['office', 'subscription'],
    });
    if (!sub) throw new NotFoundException('OfficeSubscription not found');
    return sub;
  }

  // async update(id: string, updateDto: UpdateOfficeSubscriptionDto) {
  //   const sub = await this.officeSubscriptionRepository.findOne({ where: { id } });
  //   if (!sub) throw new NotFoundException('OfficeSubscription not found');

  //   Object.assign(sub, updateDto);
  //   return await this.officeSubscriptionRepository.save(sub);
  // }

  async remove(userId: string, id: string) {

    const office = await this.officeRepository.findOne({
      where: {
        user: {
          id: userId
        },
        // officeSubscription:{
        //   id
        // }
      }, relations: ['officeSubscription']
    })

    if (office?.officeSubscription?.id != id) {
      throw new ForbiddenException("You don't have a subscription to delete it!")
    }

    // office.officeSubscription = null;

    await this.officeRepository.save(office);

    const result = await this.officeSubscriptionRepository.delete(id);

    return { message: 'Deleted successfully' };
  }


  private returnTheEndDate(duration: string): Date {
    const now = new Date();
    const endDate = new Date(now); // Copy of current date

    switch (duration) {
      case '1 Mon':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case '2 Mon':
        endDate.setMonth(endDate.getMonth() + 2);
        break;
      case '3 Mon':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '6 Mon':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '1 Year':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid subscription duration');
    }

    return endDate;
  }

}

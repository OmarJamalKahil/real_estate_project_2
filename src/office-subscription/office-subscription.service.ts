import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOfficeSubscriptionDto } from './dto/create-office-subscription.dto';
import { UpdateOfficeSubscriptionDto } from './dto/update-office-subscription.dto';
import { OfficeSubscription } from './entities/office-subscription.entity';
import { Office } from 'src/office/entities/office.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { PaymentCardService } from 'src/payment-card/payment-card.service';

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

  ) { }

  async create(officeManagerId: string, createDto: CreateOfficeSubscriptionDto) {


    const subscription = await this.subscriptionRepository.findOne({
      where: { id: createDto.subscriptionId },
    });

    
    const office = await this.officeRepository.findOne({
      where: {
        user: {
          id: officeManagerId,
        },
      },
      relations: ['properties', 'user']
      
    });
    
    
    if (!office || !subscription) {
      throw new NotFoundException('Office or Subscription not found');
    }
    
    this.paymentCardService.searchAndWithdraw({ ...createDto }, subscription?.price!)
  
    const newOfficeSubscription = this.officeSubscriptionRepository.create({
      start_date: new Date(),
      end_date: this.returnTheEndDate(subscription.duration),
      current_number_promotions: 0,
      current_number_property: office.properties.length,
      remaining_properties: (subscription.propertyNumber - office.properties.length),
      remaining_promotions: (subscription.numberOfPromotion - 0),
      office,
      subscription,
    });

    try {
      return await this.officeSubscriptionRepository.save(newOfficeSubscription);
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException('Failed to create subscription');
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

    office.officeSubscription = null;

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

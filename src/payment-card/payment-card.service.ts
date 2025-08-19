import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { SearchPaymentCardDto } from './dto/create-payment-card.dto';
import { PaymentCard, PaymentCardType } from './entities/payment-card.entity';

@Injectable()
export class PaymentCardService { 
  constructor(
    @InjectRepository(PaymentCard)
    private readonly paymentCardRepository: Repository<PaymentCard>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource, // Needed for QueryRunner
  ) { }

  async searchAndWithdraw(
    searchPaymentCardDto: SearchPaymentCardDto,
    amount: number,
    manager: EntityManager 
  ) {

    // const queryRunner = manager;

    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    try {
      const userCard = await manager.findOne(PaymentCard, {
        where: {
          cvv: searchPaymentCardDto.cvv,
          cardNumber: searchPaymentCardDto.cardNumber,
          expiryMonth: searchPaymentCardDto.expiryMonth,
          expiryYear: searchPaymentCardDto.expiryYear,
          type: searchPaymentCardDto.type,
        },
      });

      if (!userCard) {
        throw new NotFoundException('Payment card not found');
      }

      if (Number(userCard.money) < Number(amount)) {
        throw new BadRequestException('Not enough funds to subscribe');
      }

      const systemCard = await manager.findOne(PaymentCard, {
        where: {
          cvv: this.configService.get<string>('CARD_CVV'),
          cardNumber: this.configService.get<string>('CARD_NUMBER'),
          expiryMonth: Number(this.configService.get<number>('CARD_EXPIRY_MONTH')),
          expiryYear: Number(this.configService.get<number>('CARD_EXPIRE_YEAR')),
          type: this.configService.get<PaymentCardType>('CARD_TYPE'),
        },
      });

      if (!systemCard) {
        throw new InternalServerErrorException('System card not found');
      }

      // Transfer money
      userCard.money = Number(userCard.money) - Number(amount);
      systemCard.money = Number(systemCard.money) + Number(amount);


      await manager.save([userCard, systemCard]);

      // await queryRunner.commitTransaction(); 
      return { success: true };
    } catch (error) {
      // await queryRunner.rollbackTransaction();
                
      throw error;
    } 
  }
}

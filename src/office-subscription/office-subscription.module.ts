import { forwardRef, Module } from '@nestjs/common';
import { OfficeSubscriptionService } from './office-subscription.service';
import { OfficeSubscriptionController } from './office-subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeSubscription } from './entities/office-subscription.entity';
import { Office } from 'src/office/entities/office.entity';
import { Subscription } from 'src/subscription/entities/subscription.entity';
import { PaymentCard } from 'src/payment-card/entities/payment-card.entity';
import { PaymentCardModule } from 'src/payment-card/payment-card.module';
import { OfficeModule } from 'src/office/office.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficeSubscription, Office, Subscription, PaymentCard
    ]),
    PaymentCardModule,

    forwardRef(() => SubscriptionModule),
    forwardRef(() => OfficeModule),
  ],
  controllers: [OfficeSubscriptionController],
  providers: [OfficeSubscriptionService],
  exports: [OfficeSubscriptionService]
})
export class OfficeSubscriptionModule { }

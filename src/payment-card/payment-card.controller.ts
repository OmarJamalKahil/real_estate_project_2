import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentCardService } from './payment-card.service';


@Controller('payment-card')
export class PaymentCardController {
  constructor(private readonly paymentCardService: PaymentCardService) { }



}

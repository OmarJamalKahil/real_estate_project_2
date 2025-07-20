
// src/electronic-card/dto/create-payment-card.dto.ts

import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
import { PaymentCardType } from '../entities/payment-card.entity';

export class SearchPaymentCardDto {
  @IsEnum(PaymentCardType)
  type: PaymentCardType;

  @IsString()
  @Matches(/^\d+$/, { message: 'cardNumber must contain only digits' })
  @Length(12, 19, { message: 'cardNumber must be between 12 and 19 digits' })
  cardNumber: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth: number;

  @IsNumber()
  @Min(new Date().getFullYear()) // adjust logic as needed
  @Max(new Date().getFullYear() + 20)
  expiryYear: number;

  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'cvv must be 3 or 4 digits' })
  cvv: string;

}

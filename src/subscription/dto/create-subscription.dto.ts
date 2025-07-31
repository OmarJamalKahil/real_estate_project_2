// create-subscription.dto.ts
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Durations } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  description: string;

  @IsNumber()
  @IsInt()
  propertyNumber: number;

  @IsNumber()
  numberOfPromotion: number;

  @IsEnum(Durations)
  duration: Durations;
}

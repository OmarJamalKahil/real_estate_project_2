import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyTypeOperation } from 'src/property/common/property-type-operation.enum';

export class CreateRecordDto {
  
  @IsNotEmpty()
  @IsNumber()
  owner_personal_Identity_Number: number;

  @IsNotEmpty()
  @IsString()
  owner_name: string;

  @IsNotEmpty()
  @IsNumber()
  client_personal_Identity_Number: number;

  @IsNotEmpty()
  @IsString()
  client_name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsEnum(PropertyTypeOperation)
  type: PropertyTypeOperation;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  sell_Date: Date | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  rental_Start_Date: Date | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  rental_End_Date: Date | null;
}

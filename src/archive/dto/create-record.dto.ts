import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNotEmpty,
  Matches,
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
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'sell_Date must be in format YYYY-MM-DD',
  })
  sell_Date: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'sell_Date must be in format YYYY-MM-DD',
  })
  rental_Start_Date: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'sell_Date must be in format YYYY-MM-DD',
  })
  rental_End_Date: string | null;
}

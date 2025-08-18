import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateAttributeDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  value: number;

  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}
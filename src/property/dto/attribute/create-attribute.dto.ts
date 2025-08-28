import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateAttributeDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => String)
  @IsString()
  value: string;

  @IsUUID()
  @IsNotEmpty()
  propertyId: string;
}
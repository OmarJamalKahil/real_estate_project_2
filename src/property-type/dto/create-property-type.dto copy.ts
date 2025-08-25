import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TypeOfPropertyType } from '../entities/property-type.entity';

export class CreatePropertyTypeDto {

  @IsString()
  @IsNotEmpty()
  name: string;



  @IsEnum(TypeOfPropertyType)
  @IsNotEmpty()
  type: TypeOfPropertyType;
}

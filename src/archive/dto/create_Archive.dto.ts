import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { Location } from 'src/property/entities/location.entity';

export class CreateArchiveDto {
  @IsNumber()
  @IsNotEmpty()
  property_Number: number;

  @IsNotEmpty()
  @IsString()
  propertyType: string;

  @IsNotEmpty()
  @IsString()
  typeOfPropertyType: string;

  @IsNotEmpty()
  @IsString()
  space: string;

  @IsNotEmpty()
  @IsUUID()
  location_Id: string;
}

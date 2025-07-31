import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreatePropertyAttributeDto {
  @IsNotEmpty()
  @IsString()
  attributeName: string;  // use attributeName, clearer casing

  @IsString()
  @IsNotEmpty()
  value: string; // value is better as string, can hold numbers as strings
}

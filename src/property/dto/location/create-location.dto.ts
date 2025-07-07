import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  governorate: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsString()
  @IsNotEmpty()
  street: string;
}

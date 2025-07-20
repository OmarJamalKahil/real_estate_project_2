import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePropertyTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

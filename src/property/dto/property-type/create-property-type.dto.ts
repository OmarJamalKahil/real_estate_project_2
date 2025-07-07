import { IsString } from 'class-validator';

export class CreatePropertyTypeDto {
  @IsString()
  name: string;
}

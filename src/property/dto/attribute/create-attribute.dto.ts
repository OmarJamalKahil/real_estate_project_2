import { IsString, IsBoolean } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsBoolean()
  isUnique: boolean;
}

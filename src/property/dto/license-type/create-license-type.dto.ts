import { IsString } from 'class-validator';

export class CreateLicenseTypeDto {
  @IsString()
  name: string;
}

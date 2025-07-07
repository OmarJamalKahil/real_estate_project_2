import { IsUUID, IsString, IsDateString } from 'class-validator';

export class CreateLicenseDetailsDto {

  @IsString()
  licenseNumber: string;

  @IsDateString()
  date: string;
}

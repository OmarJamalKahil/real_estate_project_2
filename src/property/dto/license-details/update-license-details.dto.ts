import { PartialType } from '@nestjs/mapped-types';
import { CreateLicenseDetailsDto } from './create-license-details.dto';

export class UpdateLicenseDetailsDto extends PartialType(CreateLicenseDetailsDto) {}

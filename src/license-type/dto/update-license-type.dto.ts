import { PartialType } from '@nestjs/mapped-types';
import { CreateLicenseTypeDto } from './create-license-type.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLicenseTypeDto {

    @IsString()
    @IsNotEmpty()
    name: string;
}

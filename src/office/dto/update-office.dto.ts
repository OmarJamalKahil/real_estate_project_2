import { PartialType } from '@nestjs/mapped-types';
import { CreateOfficeDto } from './create-office.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateOfficeDto {



    @IsOptional()
    @IsString()
    name: string;


    @IsOptional()
    @IsPhoneNumber("SY")
    office_phone: string;

    @IsOptional()
    @IsEmail()
    office_email?: string;


}

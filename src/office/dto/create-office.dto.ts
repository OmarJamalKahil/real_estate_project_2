import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches, MinLength } from "class-validator";

export class CreateOfficeDto {


    @IsNotEmpty()
    @IsString()
    name: string;

    
    @IsNotEmpty()
    @IsPhoneNumber("SY")
    office_phone: string;

    @IsNotEmpty()
    @IsEmail()
    office_email: string;

    @IsString()
    @IsNotEmpty()
    license_number: string;

    @IsString()
    @IsNotEmpty()
    personal_identity_number: string;


}

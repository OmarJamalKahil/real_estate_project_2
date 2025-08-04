import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Matches, MinLength } from "class-validator";

export class CreateOfficeDto {


    @IsNotEmpty()
    @IsString()
    name: string;

    // @IsNotEmpty()
    // @IsPhoneNumber("SY")
    // office_phone: string;

    // @IsNotEmpty()
    // @IsEmail()
    // office_email: string;

    //omar
    @IsNotEmpty()
    @IsString()
    receiver_identifier: string;

    @IsString()
    @IsNotEmpty()
    license_number: string;

    @IsString()
    @IsNotEmpty()
    personal_identity_number: string;

    //omar
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
    @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
    @Matches(/(?=.*[@$!%*?&])/, { message: 'Password must contain at least one special character' })
    password: string;

}

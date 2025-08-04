import { IsBoolean, IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";





export class CreateUserDto {

    @IsNotEmpty()
    @IsEmail()
    email:string;
    
    @IsNotEmpty()
    @IsPhoneNumber("SY")
    phone:string;

}

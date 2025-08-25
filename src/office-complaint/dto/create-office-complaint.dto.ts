import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsUUID } from "class-validator";

export class CreateOfficeComplaintDto {


    @IsUUID()
    @IsNotEmpty()
    officeId: string;

    
    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsNotEmpty()
    @IsString()
    content: string;
}

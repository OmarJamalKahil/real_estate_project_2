import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsUUID } from "class-validator";

export class CreatePropertyComplaintDto {
    
    @IsUUID()
    @IsNotEmpty()
    propertyId: string;

    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsNotEmpty()
    @IsString()
    content: string;
}

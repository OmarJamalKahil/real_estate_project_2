import { IsEmail, IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from "class-validator";

export class CreateOrUpdateOfficeRatingDto {

    @IsString()
    @IsNotEmpty()
    officeId: string;

    @IsNumber()
    @IsNotEmpty()
    numberOfStars: number;


}

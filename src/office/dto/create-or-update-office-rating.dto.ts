import { IsEmail, IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from "class-validator";

export class CreateOrUpdateOfficeRatingDto {

    @IsNumber()
    rating: number;


}

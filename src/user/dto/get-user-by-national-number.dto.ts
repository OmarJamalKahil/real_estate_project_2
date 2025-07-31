import { IsNotEmpty, IsString, Length } from "class-validator";



export class GetUserByNationalNumberDto {

    @IsString()
    @IsNotEmpty()
    @Length(15,15,{message:"national number must be 15 number"})
    national_number:string;

}
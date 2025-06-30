import { IsNotEmpty, IsString } from "class-validator";

export class CreateOfficeDto {


    @IsNotEmpty()
    @IsString()
    name:string;

    @IsString()
    @IsNotEmpty()
    license_number:string;

    @IsString()
    @IsNotEmpty()
    personal_identity_number:string;

}

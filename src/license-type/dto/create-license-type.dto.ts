import { IsNotEmpty, IsString } from "class-validator";

export class CreateLicenseTypeDto {


    @IsString()
    @IsNotEmpty()
    name: string;
}

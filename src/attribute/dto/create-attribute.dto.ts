import { IsNotEmpty, IsString } from "class-validator";

export class CreateAttributeDto {

    @IsNotEmpty()
    @IsString()
    name:string;

    @IsNotEmpty()
    @IsString()
    type:string;
}

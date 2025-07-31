import { IsNotEmpty, IsString, IsUUID } from "class-validator";




export class CreateFavoriteOfficeDto {

    @IsString()
    @IsUUID()
    @IsNotEmpty()
    officeId:string;
}

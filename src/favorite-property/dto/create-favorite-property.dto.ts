import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateFavoritePropertyDto {


    @IsUUID()
    @IsNotEmpty()
    propertyId: string;
    



}

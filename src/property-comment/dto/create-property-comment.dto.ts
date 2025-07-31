import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreatePropertyCommentDto {


    @IsNotEmpty()
    @IsUUID()
    propertyId: string;


    @IsNotEmpty()
    @IsString()
    content: string;

}

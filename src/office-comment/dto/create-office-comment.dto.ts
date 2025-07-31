import { IsNotEmpty, IsString, IsUUID } from "class-validator";



export class CreateOfficeCommentDto {


    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    @IsUUID()
    officeId: string;

}

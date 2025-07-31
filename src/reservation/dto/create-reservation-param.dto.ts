import { IsNotEmpty, IsUUID } from "class-validator";



export class CreateReservationParamDto {

    @IsUUID()
    @IsNotEmpty()
    id:string;

}
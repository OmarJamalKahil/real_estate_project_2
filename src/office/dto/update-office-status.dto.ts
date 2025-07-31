import { IsEnum, IsNotEmpty } from "class-validator";
import { OfficeCreatingStatus } from "../entities/office.entity";



export class UpdateOfficeStatusDto {


    @IsEnum(OfficeCreatingStatus)
    @IsNotEmpty()
    status: OfficeCreatingStatus;


}
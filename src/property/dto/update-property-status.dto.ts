import { IsEnum, IsNotEmpty } from "class-validator";
import { PropertyStatus } from "../common/property-status.enum";

export class UpdatePropertyStatusDto {

    @IsEnum(PropertyStatus)
    @IsNotEmpty()
    status:PropertyStatus
}
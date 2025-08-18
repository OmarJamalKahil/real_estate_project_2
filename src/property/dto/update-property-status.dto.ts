import { IsEnum, IsNotEmpty } from "class-validator";
import { EnumStatus } from "../common/property-status.enum";

export class UpdatePropertyStatusDto {

    @IsEnum(EnumStatus)
    @IsNotEmpty()
    status:EnumStatus
}
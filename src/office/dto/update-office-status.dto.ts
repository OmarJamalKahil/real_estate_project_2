import { IsEnum, IsNotEmpty } from "class-validator";
import { EnumStatus } from "src/property/common/property-status.enum";



export class UpdateOfficeStatusDto {

    @IsEnum(EnumStatus)
    @IsNotEmpty()
    status: EnumStatus;

}
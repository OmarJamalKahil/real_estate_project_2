import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { EnumPropertyRequestStatus } from "../entities/property-request.entity";
import { Type } from "class-transformer";







export class UpdatePropertyRequestByAdminDto {



    @IsEnum(EnumPropertyRequestStatus)
    @IsNotEmpty()
    status: EnumPropertyRequestStatus

    @IsString()
    @IsOptional()
    propertyNumber?: string;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    expireDate?: Date;


}
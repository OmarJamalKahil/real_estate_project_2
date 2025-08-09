import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsUUID } from "class-validator";



export class CreateRentalExpirationDateDto {

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    expireDate: Date;

    @IsUUID()
    @IsNotEmpty()
    propertyNumber: string;

}
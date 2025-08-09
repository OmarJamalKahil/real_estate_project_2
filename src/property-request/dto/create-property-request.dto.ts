import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PropertyTypeOperation } from "src/property/common/property-type-operation.enum";

export class CreatePropertyRequestDto {

    @IsString()
    @IsNotEmpty()
    propertyNumber: string;

    @IsEnum(PropertyTypeOperation)
    @IsNotEmpty()
    typeOperation: PropertyTypeOperation




}

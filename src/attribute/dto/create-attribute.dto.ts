import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { AttributeType } from "../entities/attribute.entity";

export class CreateAttributeDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(AttributeType)
    type: AttributeType;
}

import { ArrayNotEmpty, IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class LinkAttributesToPropertyTypeDto {
  @IsUUID()
  @IsNotEmpty()
  propertyTypeId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("all", { each: true }) // كل عنصر في المصفوفة يجب أن يكون UUID
  attributeIds: string[];
}

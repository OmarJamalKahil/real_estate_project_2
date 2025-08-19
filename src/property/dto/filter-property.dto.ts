import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsObject,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TypeOfPropertyType } from 'src/property-type/enum/type-of-property-type.enum';

// class PurposeDto {
//   @IsOptional()
//   @IsBoolean()
//   selling?: boolean;

//   @IsOptional()
//   @IsBoolean()
//   renting?: boolean;
// }

// class AttributeFilterDto {
//   @IsString()
//   attribute: string;

//   @IsNumber()
//   value: number;
// }

// class LocationDto {
//   @IsOptional()
//   @IsString()
//   governorate?: string;

//   @IsOptional()
//   @IsString()
//   province?: string;

//   @IsOptional()
//   @IsString()
//   city?: string;

//   @IsOptional()
//   @IsString()
//   street?: string;
// }

// export class FilterPropertyDto {
//   @IsOptional()
//   @IsString()
//   propertyType?: string;

//   @IsOptional()
//   @ValidateNested()
//   @Type(() => PurposeDto)
//   purpose?: PurposeDto;

//   @IsOptional()
//   @IsArray()
//   @Type(() => Number)
//   price?: number[]; // [min, max]

//   @IsOptional()
//   @IsArray()
//   @Type(() => Number)
//   space?: number[]; // [min, max]

//   @IsOptional()
//   @IsString()
//   licenseType?: string;

//   @IsOptional()
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => AttributeFilterDto)
//   attributeFilters?: AttributeFilterDto[];

//   @IsOptional()
//   @ValidateNested()
//   @Type(() => LocationDto)
//   location?: LocationDto;
// }




















class PurposeDto {
  @IsOptional()
  @IsBoolean()
  selling?: boolean;

  @IsOptional()
  @IsBoolean()
  renting?: boolean;
}

class AttributeFilterDto {
  @IsUUID()
  attributeId: string;

  @IsString()
  value: string;
}

class LocationDto {
  @IsOptional()
  @IsString()
  governorate?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  street?: string;
}

export class FilterPropertyDto {
  @IsOptional()
  @IsUUID()
  propertyTypeId?: string;

  @IsOptional()
  @IsEnum(TypeOfPropertyType)
  typeOfPropertyType?: TypeOfPropertyType;

  @IsOptional()
  @ValidateNested()
  @Type(() => PurposeDto)
  purpose?: PurposeDto;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  price?: number[]; // [min, max]

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  space?: number[]; // [min, max]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeFilterDto)
  attributeFilters?: AttributeFilterDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

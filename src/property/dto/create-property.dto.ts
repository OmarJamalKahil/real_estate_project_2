// import { Type } from 'class-transformer';
// import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
// import { CreateLocationDto } from './location/create-location.dto';
// import { CreatePropertyAttributeDto } from './property-attribute/create-property-attribute.dto';

// export class CreatePropertyDto {

//     @IsString()
//     @IsNotEmpty()
//     propertyNumber: string;

//     @IsNumber()
//     @Type(() => Number)  // Transform to number
//     space: number;

//     @IsNumber()
//     @Type(() => Number)  // Transform to number
//     price: number;

//     @IsString()
//     @IsNotEmpty()
//     description: string;

//     @IsString()
//     @IsNotEmpty()
//     propertyType: string;

    
//     @IsString()
//     @IsNotEmpty()
//     governorate: string;
    
//     @IsString()
//     @IsNotEmpty()
//     province: string;
    
    
//     @IsString()
//     @IsNotEmpty()
//     city: string;
    
    
//     @IsString()
//     @IsNotEmpty()
//     street: string;
    
// @IsArray(
//      @IsNotEmpty()
//   @IsString()
//   attributeName: string;  // use attributeName, clearer casing

//   @IsString()
//   @IsNotEmpty()
//   value: string; // value is better as string, can hold numbers as strings
// )


// }


// @IsArray()
// @IsNotEmpty()
// @ValidateNested({ each: true })
// @Type(() => CreatePropertyAttributeDto)
// attributes: CreatePropertyAttributeDto[];

// @IsNotEmpty()
// @ValidateNested()
// @Type(() => CreateLocationDto)
// location: CreateLocationDto;


// import { Type } from 'class-transformer';
// import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';

// class Attribute {
//   @IsString()
//   @IsNotEmpty()
//   attributeName: string;

//   @IsString()
//   @IsNotEmpty()
//   value: string;
// }

// export class CreatePropertyDto {
//   @IsString()
//   @IsNotEmpty()
//   propertyNumber: string;

//   @IsNumber()
//   @Type(() => Number)
//   space: number;

//   @IsNumber()
//   @Type(() => Number)
//   price: number;

//   @IsString()
//   @IsNotEmpty()
//   description: string;

//   @IsString()
//   @IsNotEmpty()
//   propertyType: string;

//   // location flattened
//   @IsString()
//   @IsNotEmpty()
//   governorate: string;

//   @IsString()
//   @IsNotEmpty()
//   province: string;

//   @IsString()
//   @IsNotEmpty()
//   city: string;

//   @IsString()
//   @IsNotEmpty()
//   street: string;

//   // attributes as array of objects
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => Attribute)
//   attributes: Attribute[];
// }











// import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
// import { Type } from 'class-transformer';

// class Attribute {
//   @IsString()
//   @IsNotEmpty()
//   attributeName: string;

//   @IsString()
//   @IsNotEmpty()
//   value: string;
// }

// export class CreatePropertyDto {
//   @IsString()
//   @IsNotEmpty()
//   propertyNumber: string;

//   @IsNumber()
//   space: number;

//   @IsNumber()
//   price: number;

//   @IsString()
//   @IsNotEmpty()
//   description: string;

//   @IsString()
//   @IsNotEmpty()
//   propertyType: string;

//   // Flattened location
//   @IsString()
//   @IsNotEmpty()
//   governorate: string;

//   @IsString()
//   @IsNotEmpty()
//   province: string;

//   @IsString()
//   @IsNotEmpty()
//   city: string;

//   @IsString()
//   @IsNotEmpty()
//   street: string;

//   // Attributes as an array of objects
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => Attribute)
//   @IsNotEmpty()
//   attributes: Attribute[];
// }






import { IsString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  propertyNumber: string;

  @IsNumber() 
  space: number;

  @IsNumber()
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  propertyType: string;

  @IsString()
  @IsNotEmpty()
  governorate: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsArray()
  @IsNotEmpty()
  attributes: Array<{ attributeName: string; value: string }>;
}

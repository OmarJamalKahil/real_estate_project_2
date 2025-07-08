
import { Transform, Type } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, IsArray, ValidateNested, IsNotEmptyObject, IsObject, IsDefined, IsUUID } from 'class-validator';


export class CreateAttributeDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  value: number;
}

class CreateLocationDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  governorate: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  street: string;
}


export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  propertyNumber: string;

  @Type(() => Number)
  @IsNumber()
  space: number;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @IsString()
  propertyType: string;
  
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  ownerId:string;
  
  @Transform(({ value }) => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Object.assign(new CreateLocationDto(), parsed);
    } catch {
      return new CreateLocationDto(); // empty object with correct class type
    }
  })
  @ValidateNested()
  @Type(() => CreateLocationDto)
  @IsObject()
  location: CreateLocationDto;
  

  


  
  
  
  
  @Transform(({ value }) => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return parsed.map((item) => Object.assign(new CreateAttributeDto(), item));
    } catch {
      return [];
    }
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeDto)
  attributes: CreateAttributeDto[];
  
  
  
}

// @IsArray()
// @ValidateNested({ each: true })
// @Type(() => CreateAttributeDto)
// @Transform(({ value }) => {
  //   try {
    //     console.log(typeof value);
    //     console.log(JSON.parse(value));
    
    //     return  typeof value === 'string' ? JSON.parse(value) : value;
    //   } catch {
      //     return [];
      //   }
      // })
      // attributes: CreateAttributeDto[];
      
      
        // @Type(() => CreateLocationDto)
        // @IsObject()
        // @ValidateNested()
        // @Transform(({ value }) => {
        //   try {
        //     console.log(typeof value);
        //     console.log(JSON.parse(value));
      
        //     return { key: typeof value === 'string' ? JSON.parse(value) : value};
        //   } catch {
        //     return {};
        //   }
        // })
        // location: CreateLocationDto;
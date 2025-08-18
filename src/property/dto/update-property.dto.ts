import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PropertyTypeOperation } from '../common/property-type-operation.enum';
import { Type } from 'class-transformer';

export class UpdatePropertyDto {


    @IsEnum(PropertyTypeOperation)
    // @IsNotEmpty()
    @IsOptional()
    typeOperation?: PropertyTypeOperation

    @Type(() => Number)
    @IsNumber()
    price: number;

    @IsString()
    description: string;

}

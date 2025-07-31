import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {

        @IsString()
        @IsOptional()
        first_name: string;
    
        @IsString()
        @IsOptional()
        last_name: string;
    
        @IsString()
        @IsOptional()
        @IsNotEmpty()
        receiver_identifier: string;

}

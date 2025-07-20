import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyCommentDto } from './create-property-comment.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePropertyCommentDto {


    @IsString()
    @IsNotEmpty()
    content:string;


}

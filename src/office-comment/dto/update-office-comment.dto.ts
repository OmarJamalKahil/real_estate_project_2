import { PartialType } from '@nestjs/mapped-types';
import { CreateOfficeCommentDto } from './create-office-comment.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOfficeCommentDto extends PartialType(CreateOfficeCommentDto) {
    
    
    @IsString()
    @IsNotEmpty()
    content: string;

}


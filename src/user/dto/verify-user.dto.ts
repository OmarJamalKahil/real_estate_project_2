import { IsNotEmpty, Length } from "class-validator";




export class VerifyUserDto {
  
    @IsNotEmpty()
    @Length(6,6)
    verify_code: string;
} 
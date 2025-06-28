import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";



export class ResetUserPassword {
    
        @IsString()
        @IsNotEmpty()
        @MinLength(8, { message: 'Password must be at least 8 characters long' })
        @Matches(/(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter' })
        @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
        @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
        @Matches(/(?=.*[@$!%*?&])/, { message: 'Password must contain at least one special character' })
        new_password: string;

}
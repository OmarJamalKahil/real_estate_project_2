import { Office } from "src/office/entities/office.entity";
import { Upload } from "../entities/upload.entity";
import { Role } from "../entities/user.entity";


export class UserResponseDto {

    id: string;

    first_name: string;

    last_name: string;

    receiver_identifier:string;

    profile_photo?: Upload;

    user_role: Role;

    // office?: Office ;

    phone: string;


    email: string;




}
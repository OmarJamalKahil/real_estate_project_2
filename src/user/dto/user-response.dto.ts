import { Office } from "src/office/entities/office.entity";
import { Upload } from "../entities/upload.entity";
import { Banned } from "../entities/banned.entity";
import { Warning } from "../entities/warning.entity";
import { UserWarnings } from "../entities/user-warnings.entity";
import { Role } from "src/common/enums/role.enum";


export class UserResponseDto {

    id: string;

    first_name: string;

    last_name: string;

    national_number: string;

    profile_photo?: Upload;

    role: Role;

    // office?: Office ;

    phone: string;


    email: string;

    banned?: Banned | undefined;

    userWarnings?: UserWarnings | undefined;



}
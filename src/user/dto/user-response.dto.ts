import { Office } from "src/office/entities/office.entity";
import { Role } from "../entities/user.entity";
import { Banned } from "../entities/banned.entity";
import { Warning } from "../entities/warning.entity";
import { UserWarnings } from "../entities/user-warnings.entity";
import { Photo } from "src/common/entities/Photo.entity";


export interface UserResponseDto {

    id: string;

    first_name: string;

    last_name: string;

    national_number: string;

    profile_photo?: Photo;

    role: Role;

    phone: string;

    email: string;

    banned?: Banned | undefined;

    userWarnings?: UserWarnings | undefined;



}
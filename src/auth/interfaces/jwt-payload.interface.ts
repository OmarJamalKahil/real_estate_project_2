import { Role } from "src/common/enums/role.enum";

export interface JwtPayload {
  userId: string;
  role: Role;
}

import { Role } from "src/user/entities/user.entity";

export interface JwtPayload {
  userId: string;
  role: Role;
}

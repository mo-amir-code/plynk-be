import { UserRole } from "../../generated/client/client";

export interface UserPayload {
  id: string;
  role: UserRole;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: UserRole;
  };
  token: string;
}

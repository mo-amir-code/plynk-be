import { OwnerType } from "../../generated/client/client";

export interface UserPayload {
  id: string;
  role: OwnerType;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: OwnerType;
  };
  token: string;
}

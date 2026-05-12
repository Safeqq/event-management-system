import { User } from "../../../domain/entities/user";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "organizer" | "customer";
}

export interface AuthService {
  register(input: RegisterInput): Promise<User>;
  login(email: string, password: string): Promise<{ token: string; user: User }>;
}

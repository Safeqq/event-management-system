import type { Email } from "../value-objects/email";
import type { Entity } from "./entity";

export type UserRole = "organizer" | "customer" | "admin";

export interface UserState extends Entity {
  id: string;
  name: string;
  email: Email;
  role: UserRole;
  createdAt: Date;
}

export const createUser = (id: string, name: string, email: Email, role: UserRole, createdAt: Date): UserState => ({
  id, name, email, role, createdAt,
});

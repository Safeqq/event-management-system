import { Entity } from "./entity";
import { Email } from "../value-objects/email";

export type UserRole = "organizer" | "customer" | "admin";

export class User extends Entity {
  constructor(
    public readonly id: string,
    public name: string,
    public email: Email,
    public role: UserRole,
    public readonly createdAt: Date,
  ) {
    super(id);
  }
}

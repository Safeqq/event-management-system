import type { UserState } from "../aggregates/user";

export interface UserRepository {
  findById(id: string): Promise<UserState | null>;
  findByEmail(email: string): Promise<UserState | null>;
  save(user: UserState): Promise<void>;
  update(user: UserState): Promise<void>;
}

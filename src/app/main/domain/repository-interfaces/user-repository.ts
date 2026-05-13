import type { UserState } from "../entities/user";

export interface UserRepository {
  findById(id: string): Promise<UserState | null>;
  findByEmail(email: string): Promise<UserState | null>;
  save(user: UserState): Promise<void>;
  update(user: UserState): Promise<void>;
}

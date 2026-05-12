import { describe, it, expect } from "bun:test";
import { User } from "../entities/user";
import { Email } from "../value-objects/email";

describe("User", () => {
  it("should create user with valid data", () => {
    const user = new User(
      "1",
      "John Doe",
      new Email("john@example.com"),
      "customer",
      new Date(),
    );
    expect(user.name).toBe("John Doe");
    expect(user.role).toBe("customer");
  });

  it("should compare equality by id", () => {
    const a = new User("1", "A", new Email("a@a.com"), "customer", new Date());
    const b = new User("1", "B", new Email("b@b.com"), "customer", new Date());
    expect(a.equals(b)).toBe(true);
  });
});

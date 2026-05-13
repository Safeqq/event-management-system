import { describe, it, expect } from "bun:test";
import { createUser } from "../aggregates/user";
import { createEmail } from "../value-objects/email";

describe("User", () => {
  it("should create user with valid data", () => {
    const user = createUser(
      "1",
      "John Doe",
      createEmail("john@example.com"),
      "customer",
      new Date(),
    );
    expect(user.name).toBe("John Doe");
    expect(user.role).toBe("customer");
  });

  it("should compare equality by id", () => {
    const a = createUser(
      "1",
      "A",
      createEmail("a@a.com"),
      "customer",
      new Date(),
    );
    const b = createUser(
      "1",
      "B",
      createEmail("b@b.com"),
      "customer",
      new Date(),
    );
    expect(a.id === b.id).toBe(true);
  });
});

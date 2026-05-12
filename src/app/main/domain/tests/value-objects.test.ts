import { describe, it, expect } from "bun:test";
import { Email } from "../value-objects/email";
import { Money } from "../value-objects/money";
import { DateRange } from "../value-objects/date-range";
import { TicketCode } from "../value-objects/ticket-code";

describe("Email", () => {
  it("should create valid email", () => {
    const email = new Email("test@example.com");
    expect(email.value).toBe("test@example.com");
  });
});

describe("Money", () => {
  it("should create money with valid amount", () => {
    const money = new Money(10000);
    expect(money.amount).toBe(10000);
  });
});

describe("DateRange", () => {
  it("should create valid date range", () => {
    const start = new Date("2026-01-01");
    const end = new Date("2026-12-31");
    const range = new DateRange(start, end);
    expect(range.start).toBe(start);
  });
});

describe("TicketCode", () => {
  it("should generate valid ticket code", () => {
    const code = TicketCode.generate();
    expect(code.value.length).toBeGreaterThanOrEqual(8);
  });
});

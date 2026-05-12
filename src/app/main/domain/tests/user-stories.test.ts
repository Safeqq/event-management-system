import { describe, it, expect } from "bun:test";
import { Event, TicketCategory } from "../entities/event";
import { Booking, BookingItem } from "../entities/booking";
import { Ticket } from "../entities/ticket";
import { Refund } from "../entities/refund";
import { User } from "../entities/user";
import { PromoCode } from "../entities/promo-code";
import { Email } from "../value-objects/email";
import { Money } from "../value-objects/money";
import { DateRange } from "../value-objects/date-range";
import { TicketCode } from "../value-objects/ticket-code";

describe("User Story: Organizer creates & publishes event", () => {
  it("should create event with draft status", () => {
    const event = new Event("1", "Workshop", "Desc", new Date(), "Surabaya", "draft", [], "org1", new Date(), new Date());
    expect(event.status).toBe("draft");
  });

  it("should publish event with categories", () => {
    const cat: TicketCategory = { id: "c1", name: "Regular", price: 100, capacity: 50, remaining: 50 };
    const event = new Event("1", "Workshop", "Desc", new Date(), "Surabaya", "draft", [cat], "org1", new Date(), new Date());
    event.publish();
    expect(event.status).toBe("published");
  });

  it("should reject publish if no categories", () => {
    const event = new Event("1", "Workshop", "Desc", new Date(), "Surabaya", "draft", [], "org1", new Date(), new Date());
    expect(() => event.publish()).toThrow("at least one ticket category");
  });

  it("should cancel published event", () => {
    const event = new Event("1", "Workshop", "Desc", new Date(), "Surabaya", "published", [], "org1", new Date(), new Date());
    event.cancel();
    expect(event.status).toBe("cancelled");
  });
});

describe("User Story: Customer books & pays for tickets", () => {
  it("should create booking with pending status", () => {
    const items: BookingItem[] = [{ ticketCategoryId: "c1", categoryName: "Regular", quantity: 2, unitPrice: 100 }];
    const booking = new Booking("b1", "e1", "cust1", items, 200, "pending", new Date(), null);
    expect(booking.status).toBe("pending");
  });

  it("should pay booking with sufficient amount", () => {
    const items: BookingItem[] = [{ ticketCategoryId: "c1", categoryName: "Regular", quantity: 2, unitPrice: 100 }];
    const booking = new Booking("b1", "e1", "cust1", items, 200, "pending", new Date(), null);
    booking.pay(200);
    expect(booking.status).toBe("paid");
    expect(booking.paidAt).not.toBeNull();
  });

  it("should reject insufficient payment", () => {
    const booking = new Booking("b1", "e1", "cust1", [], 200, "pending", new Date(), null);
    expect(() => booking.pay(150)).toThrow("Insufficient");
  });

  it("should cancel pending booking", () => {
    const booking = new Booking("b1", "e1", "cust1", [], 200, "pending", new Date(), null);
    booking.cancel();
    expect(booking.status).toBe("cancelled");
  });
});

describe("User Story: Gate Officer checks in ticket", () => {
  it("should check in active ticket", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", TicketCode.generate(), new Money(100), "active", "John", "john@mail.com", new Date(), null);
    ticket.checkIn();
    expect(ticket.status).toBe("used");
    expect(ticket.checkedInAt).not.toBeNull();
  });

  it("should reject check-in on already used ticket", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", TicketCode.generate(), new Money(100), "used", "John", "john@mail.com", new Date(), new Date());
    expect(() => ticket.checkIn()).toThrow("Only active");
  });
});

describe("User Story: Customer requests refund & admin processes it", () => {
  it("should request refund", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Changed mind", "requested", new Date(), null, null);
    expect(refund.status).toBe("requested");
  });

  it("should approve requested refund", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Changed mind", "requested", new Date(), null, null);
    refund.approve();
    expect(refund.status).toBe("approved");
  });

  it("should reject refund with reason", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Changed mind", "requested", new Date(), null, null);
    refund.reject("Outside refund period");
    expect(refund.status).toBe("rejected");
    expect(refund.rejectionReason).toBe("Outside refund period");
  });

  it("should payout approved refund", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Changed mind", "approved", new Date(), new Date(), null);
    refund.payout();
    expect(refund.status).toBe("paid_out");
  });
});

describe("User Story: Customer uses promo code", () => {
  it("should apply percentage discount", () => {
    const period = new DateRange(new Date("2025-01-01"), new Date("2030-12-31"));
    const promo = new PromoCode("p1", "DISC10", "percentage", 10, 100, 0, new Money(0), period, true);
    const result = promo.validate(new Money(200));
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(20);
    expect(result.finalAmount).toBe(180);
  });

  it("should apply fixed discount", () => {
    const period = new DateRange(new Date("2025-01-01"), new Date("2030-12-31"));
    const promo = new PromoCode("p1", "FLAT50", "fixed", 50, 100, 0, new Money(0), period, true);
    const result = promo.validate(new Money(200));
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(50);
  });

  it("should reject expired promo code", () => {
    const period = new DateRange(new Date("2020-01-01"), new Date("2021-12-31"));
    const promo = new PromoCode("p1", "EXPIRED", "fixed", 50, 100, 0, new Money(0), period, true);
    const result = promo.validate(new Money(200));
    expect(result.valid).toBe(false);
  });

  it("should reject promo below min purchase", () => {
    const period = new DateRange(new Date("2025-01-01"), new Date("2030-12-31"));
    const promo = new PromoCode("p1", "MIN100", "fixed", 50, 100, 0, new Money(100), period, true);
    const result = promo.validate(new Money(50));
    expect(result.valid).toBe(false);
  });
});

describe("User Story: User registration", () => {
  it("should create user with valid email", () => {
    const user = new User("u1", "John", new Email("john@mail.com"), "customer", new Date());
    expect(user.role).toBe("customer");
  });

  it("should reject invalid email", () => {
    expect(() => new Email("invalid")).toThrow();
  });
});

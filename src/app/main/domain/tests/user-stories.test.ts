import { describe, it, expect } from "bun:test";
import { Event } from "../aggregates/event";
import { Booking, BookingItem } from "../aggregates/booking";
import { Ticket } from "../aggregates/ticket";
import { TicketCategory } from "../entities/ticket-category";
import { Refund } from "../aggregates/refund";
import { User } from "../aggregates/user";
import { PromoCode } from "../aggregates/promo-code";
import { Email } from "../value-objects/email";
import { Money } from "../value-objects/money";
import { DateRange } from "../value-objects/date-range";

const future = () => new Date("2026-12-31");
const past = () => new Date("2025-01-01");

function makeCategory(overrides?: Partial<TicketCategory>): TicketCategory {
  const remaining = overrides?.remaining ?? overrides?.quota ?? 50;
  return new TicketCategory(
    overrides?.id ?? "c1",
    overrides?.name ?? "Regular",
    overrides?.price ?? new Money(100),
    overrides?.quota ?? 50,
    overrides?.salesStart ?? past(),
    overrides?.salesEnd ?? future(),
    overrides?.isActive ?? true,
    remaining,
  );
}

function makeEvent(overrides?: Partial<Event>): Event {
  const cats = overrides?.categories ?? [makeCategory()];
  return new Event(
    overrides?.id ?? "e1",
    overrides?.title ?? "Workshop",
    overrides?.description ?? "Desc",
    overrides?.startDate ?? past(),
    overrides?.endDate ?? future(),
    overrides?.location ?? "Surabaya",
    overrides?.maxCapacity ?? 200,
    overrides?.status ?? "draft",
    cats,
    overrides?.organizerId ?? "org1",
    overrides?.createdAt ?? new Date(),
    overrides?.updatedAt ?? new Date(),
  );
}

function makeBooking(overrides?: Partial<Booking>): Booking {
  const items: BookingItem[] = overrides?.items ?? [
    { ticketCategoryId: "c1", categoryName: "Regular", quantity: 2, unitPrice: 100 },
  ];
  return new Booking(
    overrides?.id ?? "b1",
    overrides?.eventId ?? "e1",
    overrides?.customerId ?? "cust1",
    items,
    overrides?.totalAmount ?? 200,
    overrides?.serviceFee ?? 0,
    overrides?.status ?? "pending",
    overrides?.createdAt ?? new Date(),
    overrides?.paidAt ?? null,
    overrides?.paymentDeadline ?? new Date(Date.now() + 15 * 60 * 1000),
  );
}

describe("1. Event cannot be created with invalid schedule", () => {
  it("should reject event where end date < start date", () => {
    expect(() => new Event("e1", "Test", "Desc", future(), past(), "Loc", 100, "draft", [makeCategory()], "org1", new Date(), new Date())
    ).toThrow("End date cannot be earlier than start date");
  });
});

describe("2. Event cannot be created with zero or negative capacity", () => {
  it("should reject zero capacity", () => {
    expect(() => makeEvent({ maxCapacity: 0 })).toThrow("greater than zero");
  });
  it("should reject negative capacity", () => {
    expect(() => makeEvent({ maxCapacity: -1 })).toThrow("greater than zero");
  });
});

describe("3. Event cannot be published without active ticket category", () => {
  it("should reject publish with no categories", () => {
    const event = makeEvent({ categories: [] });
    expect(() => event.publish()).toThrow("at least one active");
  });
  it("should reject publish with only disabled categories", () => {
    const cat = makeCategory({ isActive: false });
    const event = makeEvent({ categories: [cat] });
    expect(() => event.publish()).toThrow("at least one active");
  });
});

describe("4. Ticket category quota cannot exceed event capacity", () => {
  it("should reject addCategory when quota exceeds max capacity", () => {
    const smallCat = makeCategory({ quota: 5 });
    const event = makeEvent({ categories: [smallCat], maxCapacity: 10 });
    event.publish();
    expect(() => event.addCategory("VIP", new Money(200), 20, past(), future())).toThrow("exceed event capacity");
  });
  it("should reject publish when total quota exceeds max capacity", () => {
    const cat = makeCategory({ quota: 150 });
    const event = makeEvent({ categories: [cat], maxCapacity: 100 });
    expect(() => event.publish()).toThrow("exceed event capacity");
  });
});

describe("5. Booking cannot be created with zero quantity", () => {
  it("should reject zero quantity items", () => {
    expect(() => new Booking("b1", "e1", "c1",
      [{ ticketCategoryId: "c1", categoryName: "Reg", quantity: 0, unitPrice: 100 }],
      0, 0, "pending", new Date(), null, future(),
    )).toThrow("greater than zero");
  });
});

describe("6. Booking cannot be paid after payment deadline", () => {
  it("should reject payment past deadline", () => {
    const booking = makeBooking({ paymentDeadline: new Date(Date.now() - 1000) });
    expect(() => booking.pay(200)).toThrow("Payment deadline has passed");
  });
});

describe("7. Booking cannot be paid with incorrect payment amount", () => {
  it("should reject underpayment", () => {
    const booking = makeBooking({ totalAmount: 200 });
    expect(() => booking.pay(150)).toThrow("Payment amount must equal total booking price");
  });
  it("should accept correct payment", () => {
    const booking = makeBooking({ totalAmount: 200, paymentDeadline: future() });
    booking.pay(200);
    expect(booking.status).toBe("paid");
  });
});

describe("8. Paid booking cannot expire", () => {
  it("should reject expire on paid booking", () => {
    const booking = makeBooking({ status: "paid", paidAt: new Date(), paymentDeadline: future() });
    expect(() => booking.expire()).toThrow("Only pending bookings can expire");
  });
});

describe("9. Checked-in ticket cannot be checked in again", () => {
  it("should reject duplicate check-in", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", "TCKT-001", new Money(100), "checkedIn", "John", "j@m.com", new Date(), new Date());
    expect(() => ticket.checkIn("e1")).toThrow("Ticket is not active");
  });
});

describe("10. Refund cannot be requested if ticket has already been checked in", () => {
  it("should reject refund on checked-in ticket", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", "TCKT-001", new Money(100), "checkedIn", "John", "j@m.com", new Date(), new Date());
    expect(() => ticket.markRefunded()).toThrow("Only active tickets can be refunded");
  });
});

describe("11. Refund cannot be approved if not in Requested status", () => {
  it("should reject approve on paidOut refund", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Test", "paidOut", new Date(), new Date(), null, "ref-001");
    expect(() => refund.approve()).toThrow("Only requested refunds can be approved");
  });
});

describe("12. Rejected refund must have a rejection reason", () => {
  it("should store rejection reason", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Test", "requested", new Date(), null, null, null);
    refund.reject("Outside refund period");
    expect(refund.status).toBe("rejected");
    expect(refund.rejectionReason).toBe("Outside refund period");
  });
});

describe("Event aggregate: creation & status", () => {
  it("should create event with draft status", () => {
    const event = makeEvent();
    expect(event.status).toBe("draft");
    expect(event.domainEvents.some((e) => e.eventType === "EventCreated")).toBe(true);
  });
});

describe("Event aggregate: publish", () => {
  it("should publish event with active categories", () => {
    const event = makeEvent();
    event.publish();
    expect(event.status).toBe("published");
  });
  it("should reject publish if already published", () => {
    const event = makeEvent({ status: "published" });
    expect(() => event.publish()).toThrow("Only draft events can be published");
  });
});

describe("Event aggregate: cancel", () => {
  it("should cancel published event", () => {
    const event = makeEvent({ status: "published" });
    event.cancel();
    expect(event.status).toBe("cancelled");
  });
  it("should reject cancel completed event", () => {
    const event = makeEvent({ status: "completed" });
    expect(() => event.cancel()).toThrow("Completed events cannot be cancelled");
  });
});

describe("Event aggregate: ticket category management", () => {
  it("should add new category", () => {
    const event = makeEvent({ maxCapacity: 200 });
    const cat = event.addCategory("VIP", new Money(200), 30, past(), future());
    expect(cat.name).toBe("VIP");
  });
  it("should disable category", () => {
    const cat = makeCategory();
    const event = makeEvent({ categories: [cat], status: "published" });
    event.disableCategory(cat.id);
    expect(cat.isActive).toBe(false);
  });
  it("should reject add category on cancelled event", () => {
    const event = makeEvent({ status: "cancelled" });
    expect(() => event.addCategory("VIP", new Money(200), 10, past(), future())).toThrow("Cannot add category");
  });
});

describe("Event aggregate: quota & capacity", () => {
  it("should calculate totalQuota", () => {
    const cats = [makeCategory({ quota: 50 }), makeCategory({ id: "c2", name: "VIP", quota: 30 })];
    const event = makeEvent({ categories: cats });
    expect(event.totalQuota).toBe(80);
  });
  it("should calculate remainingCapacity", () => {
    const cats = [makeCategory({ quota: 50 }), makeCategory({ id: "c2", name: "VIP", quota: 30 })];
    const event = makeEvent({ status: "published", categories: cats });
    expect(event.remainingCapacity).toBe(80);
    event.reserveCategory("c1", 10);
    expect(event.remainingCapacity).toBe(70);
  });
});

describe("Event aggregate: reserve & release tickets", () => {
  it("should reserve tickets from category", () => {
    const cat = makeCategory({ quota: 50 });
    const event = makeEvent({ status: "published", categories: [cat] });
    event.reserveCategory("c1", 10);
    expect(cat.remaining).toBe(40);
  });
  it("should reject reserve beyond remaining", () => {
    const cat = makeCategory({ quota: 5 });
    const event = makeEvent({ status: "published", categories: [cat] });
    expect(() => event.reserveCategory("c1", 10)).toThrow("Insufficient remaining quota");
  });
  it("should release tickets back to category", () => {
    const cat = makeCategory({ quota: 50 });
    const event = makeEvent({ status: "published", categories: [cat] });
    event.reserveCategory("c1", 10);
    event.releaseCategory("c1", 5);
    expect(cat.remaining).toBe(45);
  });
  it("should reject reserve on non-published event", () => {
    const event = makeEvent({ status: "draft" });
    expect(() => event.reserveCategory("c1", 1)).toThrow("Event is not published");
  });
});

describe("Event aggregate: isBookable", () => {
  it("should be bookable when published with active categories", () => {
    const event = makeEvent({ status: "published" });
    expect(event.isBookable).toBe(true);
  });
  it("should not be bookable when draft", () => {
    const event = makeEvent({ status: "draft" });
    expect(event.isBookable).toBe(false);
  });
  it("should not be bookable when cancelled", () => {
    const event = makeEvent({ status: "cancelled" });
    expect(event.isBookable).toBe(false);
  });
  it("should not be bookable when no remaining capacity", () => {
    const cat = makeCategory({ quota: 1 });
    const event = makeEvent({ status: "published", categories: [cat] });
    event.reserveCategory("c1", 1);
    expect(event.isBookable).toBe(false);
  });
});

describe("Event aggregate: getCategory", () => {
  it("should find category by id", () => {
    const event = makeEvent();
    const cat = event.getCategory("c1");
    expect(cat).toBeDefined();
    expect(cat!.name).toBe("Regular");
  });
  it("should return undefined for unknown id", () => {
    const event = makeEvent();
    expect(event.getCategory("unknown")).toBeUndefined();
  });
});

describe("Booking aggregate: creation", () => {
  it("should create with pending status", () => {
    const booking = makeBooking();
    expect(booking.status).toBe("pending");
  });
  it("should reject empty items", () => {
    expect(() => new Booking("b1", "e1", "c1", [], 0, 0, "pending", new Date(), null, future())).toThrow("Booking must have at least one item");
  });
  it("should calculate subtotal", () => {
    const booking = makeBooking();
    expect(booking.subtotal).toBe(200);
  });
  it("should include service fee in total", () => {
    const items: BookingItem[] = [{ ticketCategoryId: "c1", categoryName: "Regular", quantity: 2, unitPrice: 100 }];
    const booking = new Booking("b1", "e1", "c1", items, 210, 10, "pending", new Date(), null, future());
    expect(booking.totalAmount).toBe(210);
    expect(booking.serviceFee).toBe(10);
  });
});

describe("Booking aggregate: payment", () => {
  it("should accept correct payment on time", () => {
    const booking = makeBooking({ paymentDeadline: future() });
    booking.pay(200);
    expect(booking.status).toBe("paid");
  });
  it("should reject payment on cancelled booking", () => {
    const booking = makeBooking({ status: "cancelled" });
    expect(() => booking.pay(200)).toThrow("Only pending bookings can be paid");
  });
});

describe("Booking aggregate: cancel", () => {
  it("should cancel pending booking", () => {
    const booking = makeBooking();
    booking.cancel();
    expect(booking.status).toBe("cancelled");
  });
  it("should reject cancel on refunded booking", () => {
    const booking = makeBooking({ status: "refunded" });
    expect(() => booking.cancel()).toThrow("Booking is already finalised");
  });
});

describe("Booking aggregate: expire", () => {
  it("should expire pending booking", () => {
    const booking = makeBooking();
    booking.expire();
    expect(booking.status).toBe("expired");
  });
  it("should reject expire on paid booking", () => {
    const booking = makeBooking({ status: "paid", paidAt: new Date(), paymentDeadline: future() });
    expect(() => booking.expire()).toThrow("Only pending bookings can expire");
  });
});

describe("Ticket: check-in", () => {
  it("should check in active ticket for correct event", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", "TCKT-001", new Money(100), "active", "John", "j@m.com", new Date(), null);
    ticket.checkIn("e1");
    expect(ticket.status).toBe("checkedIn");
  });
  it("should reject wrong event", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", "TCKT-001", new Money(100), "active", "John", "j@m.com", new Date(), null);
    expect(() => ticket.checkIn("e2")).toThrow("Ticket does not match the event");
  });
  it("should reject already checked-in ticket", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", "TCKT-001", new Money(100), "checkedIn", "John", "j@m.com", new Date(), new Date());
    expect(() => ticket.checkIn("e1")).toThrow("Ticket is not active");
  });
});

describe("Ticket: lifecycle", () => {
  it("should cancel active ticket", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", "TCKT-001", new Money(100), "active", "John", "j@m.com", new Date(), null);
    ticket.cancel();
    expect(ticket.status).toBe("cancelled");
  });
  it("should mark active ticket as refunded", () => {
    const ticket = new Ticket("t1", "b1", "e1", "Regular", "TCKT-001", new Money(100), "active", "John", "j@m.com", new Date(), null);
    ticket.markRefunded();
    expect(ticket.status).toBe("refunded");
  });
});

describe("Refund: lifecycle", () => {
  it("should create with requested status", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Changed mind", "requested", new Date(), null, null, null);
    expect(refund.status).toBe("requested");
  });
  it("should approve requested refund", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Test", "requested", new Date(), null, null, null);
    refund.approve();
    expect(refund.status).toBe("approved");
  });
  it("should reject with reason", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Test", "requested", new Date(), null, null, null);
    refund.reject("Outside refund period");
    expect(refund.rejectionReason).toBe("Outside refund period");
  });
  it("should payout approved refund with reference", () => {
    const refund = new Refund("r1", "b1", new Money(100), "Test", "approved", new Date(), new Date(), null, null);
    refund.payout("PAY-REF-001");
    expect(refund.status).toBe("paidOut");
    expect(refund.paymentReference).toBe("PAY-REF-001");
  });
});

describe("PromoCode: validation", () => {
  it("should apply percentage discount", () => {
    const period = new DateRange(past(), future());
    const promo = new PromoCode("p1", "DISC10", "percentage", 10, 100, 0, new Money(0), period, true);
    const r = promo.validate(new Money(200));
    expect(r.valid).toBe(true);
    expect(r.discountAmount).toBe(20);
    expect(r.finalAmount).toBe(180);
  });
  it("should reject expired promo", () => {
    const period = new DateRange(new Date("2020-01-01"), new Date("2021-12-31"));
    const promo = new PromoCode("p1", "EXPIRED", "fixed", 50, 100, 0, new Money(0), period, true);
    expect(promo.validate(new Money(200)).valid).toBe(false);
  });
  it("should deactivate promo code", () => {
    const period = new DateRange(past(), future());
    const promo = new PromoCode("p1", "ACTIVE", "fixed", 50, 100, 0, new Money(0), period, true);
    promo.deactivate();
    expect(promo.isActive).toBe(false);
  });
});

describe("User registration", () => {
  it("should create user with valid email", () => {
    const user = new User("u1", "John", new Email("john@mail.com"), "customer", new Date());
    expect(user.role).toBe("customer");
  });
  it("should reject invalid email", () => {
    expect(() => new Email("invalid")).toThrow();
  });
});

describe("TicketCategory: sales status", () => {
  it("should detect soldOut", () => {
    const cat = makeCategory({ remaining: 0 });
    expect(cat.salesStatus).toBe("soldOut");
  });
  it("should detect comingSoon", () => {
    const later = new Date(Date.now() + 86400000);
    const cat = makeCategory({ salesStart: later });
    expect(cat.salesStatus).toBe("comingSoon");
  });
  it("should reject negative price", () => {
    expect(() => makeCategory({ price: new Money(-1) })).toThrow("cannot be negative");
  });
  it("should reject zero quota", () => {
    expect(() => makeCategory({ quota: 0 })).toThrow("greater than zero");
  });
});

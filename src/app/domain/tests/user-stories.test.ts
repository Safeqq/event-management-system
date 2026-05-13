import { describe, it, expect } from "bun:test";
import {
  createEvent,
  publishEvent,
  cancelEvent,
  addCategory,
  disableCategory,
  reserveCategory,
  releaseCategory,
  getTotalQuota,
  getRemainingCapacity,
  isBookable,
  getCategory,
} from "../aggregates/event";
import {
  createBooking,
  payBooking,
  cancelBooking,
  expireBooking,
  getSubtotal,
} from "../aggregates/booking";
import type { BookingItem } from "../aggregates/booking";
import {
  createTicket,
  checkInTicket,
  markTicketRefunded,
  cancelTicket,
} from "../aggregates/ticket";
import {
  createRefund,
  approveRefund,
  rejectRefund,
  payoutRefund,
} from "../aggregates/refund";
import { createUser } from "../entities/user";
import {
  createPromoCode,
  validatePromoCode,
  deactivatePromoCode,
} from "../entities/promo-code";
import { createEmail } from "../value-objects/email";
import { createMoney } from "../value-objects/money";
import { createDateRange } from "../value-objects/date-range";
import {
  createTicketCategory,
  getSalesStatus,
} from "../entities/ticket-category";
import type { TicketCategoryState } from "../entities/ticket-category";
import type { EventState } from "../aggregates/event";

const future = () => new Date("2026-12-31");
const past = () => new Date("2025-01-01");

function makeCategory(
  overrides?: Partial<TicketCategoryState>,
): TicketCategoryState {
  const remaining = overrides?.remaining ?? overrides?.quota ?? 50;
  return createTicketCategory(
    overrides?.id ?? "c1",
    overrides?.name ?? "Regular",
    overrides?.price ?? createMoney(100),
    overrides?.quota ?? 50,
    overrides?.salesStart ?? past(),
    overrides?.salesEnd ?? future(),
    overrides?.isActive ?? true,
    remaining,
  );
}

function makeEvent(
  overrides?: Partial<EventState> & { categories?: TicketCategoryState[] },
): EventState {
  const cats = overrides?.categories ?? [makeCategory()];
  return createEvent(
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

function makeBooking(
  overrides?: Partial<ReturnType<typeof createBooking>>,
): ReturnType<typeof createBooking> {
  const items: BookingItem[] = overrides?.items ?? [
    {
      ticketCategoryId: "c1",
      categoryName: "Regular",
      quantity: 2,
      unitPrice: 100,
    },
  ];
  return createBooking(
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
    true,
  );
}

// ============================================================
// US1: Create Event
// ============================================================
describe("US1: Create Event", () => {
  it("should create event with draft status and raise EventCreated", () => {
    const event = makeEvent();
    expect(event.status).toBe("draft");
    expect(event.domainEvents.some((e) => e.eventType === "EventCreated")).toBe(
      true,
    );
  });

  it("should reject event where end date < start date", () => {
    expect(() =>
      createEvent(
        "e1", "Test", "Desc", future(), past(), "Loc", 100,
        "draft", [makeCategory()], "org1", new Date(), new Date(),
      ),
    ).toThrow("End date cannot be earlier than start date");
  });

  it("should reject zero capacity", () => {
    expect(() => makeEvent({ maxCapacity: 0 })).toThrow("greater than zero");
  });

  it("should reject negative capacity", () => {
    expect(() => makeEvent({ maxCapacity: -1 })).toThrow("greater than zero");
  });
});

// ============================================================
// US2: Publish Event
// ============================================================
describe("US2: Publish Event", () => {
  it("should publish event with active categories and raise EventPublished", () => {
    const event = makeEvent();
    publishEvent(event);
    expect(event.status).toBe("published");
    expect(
      event.domainEvents.some((e) => e.eventType === "EventPublished"),
    ).toBe(true);
  });

  it("should reject publish if already published", () => {
    const event = makeEvent({ status: "published" });
    expect(() => publishEvent(event)).toThrow("Only draft events can be published");
  });

  it("should reject publish with no categories", () => {
    const event = makeEvent({ categories: [] });
    expect(() => publishEvent(event)).toThrow("at least one active");
  });

  it("should reject publish with only disabled categories", () => {
    const cat = makeCategory({ isActive: false });
    const event = makeEvent({ categories: [cat] });
    expect(() => publishEvent(event)).toThrow("at least one active");
  });

  it("should reject publish when total quota exceeds max capacity", () => {
    const cat = makeCategory({ quota: 150 });
    const event = makeEvent({ categories: [cat], maxCapacity: 100 });
    expect(() => publishEvent(event)).toThrow("exceed event capacity");
  });
});

// ============================================================
// US3: Cancel Event
// ============================================================
describe("US3: Cancel Event", () => {
  it("should cancel published event and raise EventCancelled", () => {
    const event = makeEvent({ status: "published" });
    cancelEvent(event);
    expect(event.status).toBe("cancelled");
    expect(
      event.domainEvents.some((e) => e.eventType === "EventCancelled"),
    ).toBe(true);
  });

  it("should reject cancel completed event", () => {
    const event = makeEvent({ status: "completed" });
    expect(() => cancelEvent(event)).toThrow("Completed events cannot be cancelled");
  });
});

// ============================================================
// US4: Create Ticket Category
// ============================================================
describe("US4: Create Ticket Category", () => {
  it("should add new category and raise TicketCategoryCreated", () => {
    const event = makeEvent({ maxCapacity: 200, startDate: future() });
    const cat = addCategory(
      event, "cat2", "VIP", createMoney(200), 30, past(), new Date("2026-06-01"),
    );
    expect(cat.name).toBe("VIP");
    expect(
      event.domainEvents.some((e) => e.eventType === "TicketCategoryCreated"),
    ).toBe(true);
  });

  it("should reject negative price", () => {
    expect(() => makeCategory({ price: createMoney(-1) })).toThrow(
      "cannot be negative",
    );
  });

  it("should reject zero quota", () => {
    expect(() => makeCategory({ quota: 0 })).toThrow("greater than zero");
  });

  it("should reject sales end before sales start", () => {
    expect(() =>
      makeCategory({ salesStart: future(), salesEnd: past() }),
    ).toThrow("Sales end must be after sales start");
  });

  it("should reject sales period ends after event start", () => {
    const event = makeEvent({ startDate: new Date("2026-06-01") });
    expect(() =>
      addCategory(event, "cat2", "VIP", createMoney(200), 10, past(), new Date("2026-07-01")),
    ).toThrow("Sales period must end before or at the event start date");
  });

  it("should accept when sales end <= event start", () => {
    const event = makeEvent({ startDate: new Date("2026-07-01") });
    const cat = addCategory(
      event, "cat2", "VIP", createMoney(200), 10, past(), new Date("2026-06-01"),
    );
    expect(cat.name).toBe("VIP");
  });

  it("should reject addCategory when quota exceeds max capacity", () => {
    const smallCat = makeCategory({ quota: 5 });
    const event = makeEvent({
      categories: [smallCat], maxCapacity: 10, startDate: future(),
    });
    publishEvent(event);
    expect(() =>
      addCategory(event, "cat2", "VIP", createMoney(200), 20, past(), new Date("2026-06-01")),
    ).toThrow("exceed event capacity");
  });

  it("should reject add category on cancelled event", () => {
    const event = makeEvent({ status: "cancelled" });
    expect(() =>
      addCategory(event, "cat2", "VIP", createMoney(200), 10, past(), future()),
    ).toThrow("Cannot add category");
  });
});

// ============================================================
// US5: Disable Ticket Category
// ============================================================
describe("US5: Disable Ticket Category", () => {
  it("should disable category and raise TicketCategoryDisabled", () => {
    const cat = makeCategory();
    const event = makeEvent({ categories: [cat], status: "published" });
    disableCategory(event, cat.id);
    expect(cat.isActive).toBe(false);
    expect(
      event.domainEvents.some((e) => e.eventType === "TicketCategoryDisabled"),
    ).toBe(true);
  });
});

// ============================================================
// US8: Create Ticket Booking
// ============================================================
describe("US8: Create Ticket Booking", () => {
  it("should create with pending status and raise BookingCreated + TicketReserved", () => {
    const booking = makeBooking();
    expect(booking.status).toBe("pending");
    expect(
      booking.domainEvents.some((e) => e.eventType === "BookingCreated"),
    ).toBe(true);
    expect(
      booking.domainEvents.some((e) => e.eventType === "TicketReserved"),
    ).toBe(true);
  });

  it("should reject empty items", () => {
    expect(() =>
      createBooking("b1", "e1", "c1", [], 0, 0, "pending", new Date(), null, future()),
    ).toThrow("Booking must have at least one item");
  });

  it("should reject zero quantity items", () => {
    expect(() =>
      createBooking("b1", "e1", "c1", [
        { ticketCategoryId: "c1", categoryName: "Reg", quantity: 0, unitPrice: 100 },
      ], 0, 0, "pending", new Date(), null, future()),
    ).toThrow("greater than zero");
  });

  it("should reject booking for unpublished event", () => {
    expect(() =>
      createBooking("b1", "e1", "c1", [
        { ticketCategoryId: "c1", categoryName: "Reg", quantity: 1, unitPrice: 100 },
      ], 100, 0, "pending", new Date(), null, future(), false),
    ).toThrow("Booking can only be created for published events");
  });

  it("should reject payment deadline before creation time", () => {
    const now = new Date();
    const pastDeadline = new Date(now.getTime() - 1000);
    expect(() =>
      createBooking("b1", "e1", "c1", [
        { ticketCategoryId: "c1", categoryName: "Reg", quantity: 1, unitPrice: 100 },
      ], 100, 0, "pending", now, null, pastDeadline),
    ).toThrow("Payment deadline must be after creation time");
  });

  it("should reserve tickets from category and reduce remaining quota", () => {
    const cat = makeCategory({ quota: 50 });
    const event = makeEvent({ status: "published", categories: [cat] });
    reserveCategory(event, "c1", 10);
    expect(cat.remaining).toBe(40);
  });

  it("should reject reserve beyond remaining quota", () => {
    const cat = makeCategory({ quota: 5 });
    const event = makeEvent({ status: "published", categories: [cat] });
    expect(() => reserveCategory(event, "c1", 10)).toThrow(
      "Insufficient remaining quota",
    );
  });

  it("should release tickets back to category quota", () => {
    const cat = makeCategory({ quota: 50 });
    const event = makeEvent({ status: "published", categories: [cat] });
    reserveCategory(event, "c1", 10);
    releaseCategory(event, "c1", 5);
    expect(cat.remaining).toBe(45);
  });

  it("should reject reserve on non-published event", () => {
    const event = makeEvent({ status: "draft" });
    expect(() => reserveCategory(event, "c1", 1)).toThrow("Event is not published");
  });

  it("should cancel pending booking and raise BookingCancelled", () => {
    const booking = makeBooking();
    cancelBooking(booking);
    expect(booking.status).toBe("cancelled");
    expect(
      booking.domainEvents.some((e) => e.eventType === "BookingCancelled"),
    ).toBe(true);
  });

  it("should reject cancel on refunded booking", () => {
    const booking = makeBooking({ status: "refunded" });
    expect(() => cancelBooking(booking)).toThrow("Booking is already finalised");
  });
});

// ============================================================
// US9: Calculate Booking Total Price
// ============================================================
describe("US9: Calculate Booking Total Price", () => {
  it("should calculate subtotal from items", () => {
    const booking = makeBooking();
    expect(getSubtotal(booking)).toBe(200);
  });

  it("should calculate subtotal from multiple items", () => {
    const items: BookingItem[] = [
      { ticketCategoryId: "c1", categoryName: "Regular", quantity: 2, unitPrice: 100 },
      { ticketCategoryId: "c2", categoryName: "VIP", quantity: 1, unitPrice: 200 },
    ];
    const booking = createBooking(
      "b1", "e1", "c1", items, 400, 0, "pending", new Date(), null, future(), true,
    );
    expect(getSubtotal(booking)).toBe(400);
  });

  it("should include service fee in total amount", () => {
    const items: BookingItem[] = [
      { ticketCategoryId: "c1", categoryName: "Regular", quantity: 2, unitPrice: 100 },
    ];
    const booking = createBooking(
      "b1", "e1", "c1", items, 210, 10, "pending", new Date(), null, future(), true,
    );
    expect(booking.totalAmount).toBe(210);
    expect(booking.serviceFee).toBe(10);
  });
});

// ============================================================
// US10: Pay Booking
// ============================================================
describe("US10: Pay Booking", () => {
  it("should accept correct payment on time and raise BookingPaid", () => {
    const booking = makeBooking({ paymentDeadline: future() });
    payBooking(booking, 200);
    expect(booking.status).toBe("paid");
    expect(
      booking.domainEvents.some((e) => e.eventType === "BookingPaid"),
    ).toBe(true);
  });

  it("should reject payment past deadline", () => {
    const createdAt = new Date(Date.now() - 60000);
    const booking = makeBooking({
      createdAt,
      paymentDeadline: new Date(Date.now() - 1000),
    });
    expect(() => payBooking(booking, 200)).toThrow("Payment deadline has passed");
  });

  it("should reject underpayment", () => {
    const booking = makeBooking({ totalAmount: 200 });
    expect(() => payBooking(booking, 150)).toThrow(
      "Payment amount must equal total booking price",
    );
  });

  it("should reject payment on cancelled booking", () => {
    const booking = makeBooking({ status: "cancelled" });
    expect(() => payBooking(booking, 200)).toThrow("Only pending bookings can be paid");
  });
});

// ============================================================
// US11: Expire Booking
// ============================================================
describe("US11: Expire Booking", () => {
  it("should expire pending booking and raise BookingExpired", () => {
    const booking = makeBooking();
    expireBooking(booking);
    expect(booking.status).toBe("expired");
    expect(
      booking.domainEvents.some((e) => e.eventType === "BookingExpired"),
    ).toBe(true);
  });

  it("should reject expire on paid booking", () => {
    const booking = makeBooking({
      status: "paid", paidAt: new Date(), paymentDeadline: future(),
    });
    expect(() => expireBooking(booking)).toThrow("Only pending bookings can expire");
  });
});

// ============================================================
// US13: Check In Ticket
// ============================================================
describe("US13: Check In Ticket", () => {
  it("should check in active ticket for correct event and raise TicketCheckedIn", () => {
    const ticket = createTicket(
      "t1", "b1", "e1", "Regular", "TCKT-001", createMoney(100),
      "active", "John", "j@m.com", new Date(), null,
    );
    checkInTicket(ticket, "e1");
    expect(ticket.status).toBe("checkedIn");
    expect(
      ticket.domainEvents.some((e) => e.eventType === "TicketCheckedIn"),
    ).toBe(true);
  });
});

// ============================================================
// US14: Reject Invalid Ticket Check-in
// ============================================================
describe("US14: Reject Invalid Ticket Check-in", () => {
  it("should reject check-in for wrong event", () => {
    const ticket = createTicket(
      "t1", "b1", "e1", "Regular", "TCKT-001", createMoney(100),
      "active", "John", "j@m.com", new Date(), null,
    );
    expect(() => checkInTicket(ticket, "e2")).toThrow(
      "Ticket does not match the event",
    );
  });

  it("should reject check-in for already checked-in ticket", () => {
    const ticket = createTicket(
      "t1", "b1", "e1", "Regular", "TCKT-001", createMoney(100),
      "checkedIn", "John", "j@m.com", new Date(), new Date(),
    );
    expect(() => checkInTicket(ticket, "e1")).toThrow("Ticket is not active");
  });
});

// ============================================================
// US15: Request Refund
// ============================================================
describe("US15: Request Refund", () => {
  it("should create refund with requested status and raise RefundRequested", () => {
    const refund = createRefund(
      "r1", "b1", createMoney(100), "Changed mind",
      "requested", new Date(), null, null, null,
    );
    expect(refund.status).toBe("requested");
    expect(
      refund.domainEvents.some((e) => e.eventType === "RefundRequested"),
    ).toBe(true);
  });

  it("should reject refund on checked-in ticket", () => {
    const ticket = createTicket(
      "t1", "b1", "e1", "Regular", "TCKT-001", createMoney(100),
      "checkedIn", "John", "j@m.com", new Date(), new Date(),
    );
    expect(() => markTicketRefunded(ticket)).toThrow(
      "Only active tickets can be refunded",
    );
  });

  it("should cancel active ticket", () => {
    const ticket = createTicket(
      "t1", "b1", "e1", "Regular", "TCKT-001", createMoney(100),
      "active", "John", "j@m.com", new Date(), null,
    );
    cancelTicket(ticket);
    expect(ticket.status).toBe("cancelled");
  });

  it("should mark active ticket as refunded", () => {
    const ticket = createTicket(
      "t1", "b1", "e1", "Regular", "TCKT-001", createMoney(100),
      "active", "John", "j@m.com", new Date(), null,
    );
    markTicketRefunded(ticket);
    expect(ticket.status).toBe("refunded");
  });
});

// ============================================================
// US16: Approve Refund
// ============================================================
describe("US16: Approve Refund", () => {
  it("should approve requested refund and raise RefundApproved", () => {
    const refund = createRefund(
      "r1", "b1", createMoney(100), "Test",
      "requested", new Date(), null, null, null,
    );
    approveRefund(refund);
    expect(refund.status).toBe("approved");
    expect(
      refund.domainEvents.some((e) => e.eventType === "RefundApproved"),
    ).toBe(true);
  });

  it("should reject approve on paidOut refund", () => {
    const refund = createRefund(
      "r1", "b1", createMoney(100), "Test",
      "paidOut", new Date(), new Date(), null, "ref-001",
    );
    expect(() => approveRefund(refund)).toThrow(
      "Only requested refunds can be approved",
    );
  });
});

// ============================================================
// US17: Reject Refund
// ============================================================
describe("US17: Reject Refund", () => {
  it("should reject with reason and raise RefundRejected", () => {
    const refund = createRefund(
      "r1", "b1", createMoney(100), "Test",
      "requested", new Date(), null, null, null,
    );
    rejectRefund(refund, "Outside refund period");
    expect(refund.status).toBe("rejected");
    expect(refund.rejectionReason).toBe("Outside refund period");
    expect(
      refund.domainEvents.some((e) => e.eventType === "RefundRejected"),
    ).toBe(true);
  });
});

// ============================================================
// US18: Mark Refund as Paid Out
// ============================================================
describe("US18: Mark Refund as Paid Out", () => {
  it("should payout approved refund with reference and raise RefundPaidOut", () => {
    const refund = createRefund(
      "r1", "b1", createMoney(100), "Test",
      "approved", new Date(), new Date(), null, null,
    );
    payoutRefund(refund, "PAY-REF-001");
    expect(refund.status).toBe("paidOut");
    expect(refund.paymentReference).toBe("PAY-REF-001");
    expect(
      refund.domainEvents.some((e) => e.eventType === "RefundPaidOut"),
    ).toBe(true);
  });
});

// ============================================================
// Supporting Domain Tests
// ============================================================
describe("Domain: quota & capacity", () => {
  it("should calculate totalQuota from all categories", () => {
    const cats = [
      makeCategory({ quota: 50 }),
      makeCategory({ id: "c2", name: "VIP", quota: 30 }),
    ];
    const event = makeEvent({ categories: cats });
    expect(getTotalQuota(event)).toBe(80);
  });

  it("should calculate remainingCapacity after reserve", () => {
    const cats = [
      makeCategory({ quota: 50 }),
      makeCategory({ id: "c2", name: "VIP", quota: 30 }),
    ];
    const event = makeEvent({ status: "published", categories: cats });
    expect(getRemainingCapacity(event)).toBe(80);
    reserveCategory(event, "c1", 10);
    expect(getRemainingCapacity(event)).toBe(70);
  });
});

describe("Domain: isBookable", () => {
  it("should be bookable when published with active categories", () => {
    const event = makeEvent({ status: "published" });
    expect(isBookable(event)).toBe(true);
  });

  it("should not be bookable when draft", () => {
    const event = makeEvent({ status: "draft" });
    expect(isBookable(event)).toBe(false);
  });

  it("should not be bookable when cancelled", () => {
    const event = makeEvent({ status: "cancelled" });
    expect(isBookable(event)).toBe(false);
  });

  it("should not be bookable when no remaining capacity", () => {
    const cat = makeCategory({ quota: 1 });
    const event = makeEvent({ status: "published", categories: [cat] });
    reserveCategory(event, "c1", 1);
    expect(isBookable(event)).toBe(false);
  });
});

describe("Domain: getCategory", () => {
  it("should find category by id", () => {
    const event = makeEvent();
    const cat = getCategory(event, "c1");
    expect(cat).toBeDefined();
    expect(cat!.name).toBe("Regular");
  });

  it("should return undefined for unknown id", () => {
    const event = makeEvent();
    expect(getCategory(event, "unknown")).toBeUndefined();
  });
});

describe("Domain: TicketCategory sales status", () => {
  it("should detect soldOut when remaining is zero", () => {
    const cat = makeCategory({ remaining: 0 });
    expect(getSalesStatus(cat)).toBe("soldOut");
  });

  it("should detect comingSoon before sales start", () => {
    const later = new Date(Date.now() + 86400000);
    const cat = makeCategory({ salesStart: later });
    expect(getSalesStatus(cat)).toBe("comingSoon");
  });
});

describe("Domain: PromoCode validation", () => {
  it("should apply percentage discount", () => {
    const period = createDateRange(past(), future());
    const promo = createPromoCode("p1", "DISC10", "percentage", 10, 100, 0, createMoney(0), period, true);
    const r = validatePromoCode(promo, createMoney(200));
    expect(r.valid).toBe(true);
    expect(r.discountAmount).toBe(20);
    expect(r.finalAmount).toBe(180);
  });

  it("should reject expired promo", () => {
    const period = createDateRange(new Date("2020-01-01"), new Date("2021-12-31"));
    const promo = createPromoCode("p1", "EXPIRED", "fixed", 50, 100, 0, createMoney(0), period, true);
    expect(validatePromoCode(promo, createMoney(200)).valid).toBe(false);
  });

  it("should deactivate promo code", () => {
    const period = createDateRange(past(), future());
    const promo = createPromoCode("p1", "ACTIVE", "fixed", 50, 100, 0, createMoney(0), period, true);
    deactivatePromoCode(promo);
    expect(promo.isActive).toBe(false);
  });
});

describe("Domain: User registration", () => {
  it("should create user with valid email", () => {
    const user = createUser("u1", "John", createEmail("john@mail.com"), "customer", new Date());
    expect(user.role).toBe("customer");
  });

  it("should reject invalid email", () => {
    expect(() => createEmail("invalid")).toThrow();
  });
});

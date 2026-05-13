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
import { createUser } from "../aggregates/user";
import {
  createPromoCode,
  validatePromoCode,
  deactivatePromoCode,
} from "../aggregates/promo-code";
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
  );
}

describe("1. Event cannot be created with invalid schedule", () => {
  it("should reject event where end date < start date", () => {
    expect(() =>
      createEvent(
        "e1",
        "Test",
        "Desc",
        future(),
        past(),
        "Loc",
        100,
        "draft",
        [makeCategory()],
        "org1",
        new Date(),
        new Date(),
      ),
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
    expect(() => publishEvent(event)).toThrow("at least one active");
  });
  it("should reject publish with only disabled categories", () => {
    const cat = makeCategory({ isActive: false });
    const event = makeEvent({ categories: [cat] });
    expect(() => publishEvent(event)).toThrow("at least one active");
  });
});

describe("4. Ticket category quota cannot exceed event capacity", () => {
  it("should reject addCategory when quota exceeds max capacity", () => {
    const smallCat = makeCategory({ quota: 5 });
    const event = makeEvent({
      categories: [smallCat],
      maxCapacity: 10,
      startDate: future(),
    });
    publishEvent(event);
    expect(() =>
      addCategory(
        event,
        "cat2",
        "VIP",
        createMoney(200),
        20,
        past(),
        new Date("2026-06-01"),
      ),
    ).toThrow("exceed event capacity");
  });
  it("should reject publish when total quota exceeds max capacity", () => {
    const cat = makeCategory({ quota: 150 });
    const event = makeEvent({ categories: [cat], maxCapacity: 100 });
    expect(() => publishEvent(event)).toThrow("exceed event capacity");
  });
});

describe("5. Booking cannot be created with zero quantity", () => {
  it("should reject zero quantity items", () => {
    expect(() =>
      createBooking(
        "b1",
        "e1",
        "c1",
        [
          {
            ticketCategoryId: "c1",
            categoryName: "Reg",
            quantity: 0,
            unitPrice: 100,
          },
        ],
        0,
        0,
        "pending",
        new Date(),
        null,
        future(),
      ),
    ).toThrow("greater than zero");
  });
});

describe("6. Booking cannot be paid after payment deadline", () => {
  it("should reject payment past deadline", () => {
    const createdAt = new Date(Date.now() - 60000);
    const booking = makeBooking({
      createdAt,
      paymentDeadline: new Date(Date.now() - 1000),
    });
    expect(() => payBooking(booking, 200)).toThrow(
      "Payment deadline has passed",
    );
  });
});

describe("7. Booking cannot be paid with incorrect payment amount", () => {
  it("should reject underpayment", () => {
    const booking = makeBooking({ totalAmount: 200 });
    expect(() => payBooking(booking, 150)).toThrow(
      "Payment amount must equal total booking price",
    );
  });
  it("should accept correct payment", () => {
    const booking = makeBooking({
      totalAmount: 200,
      paymentDeadline: future(),
    });
    payBooking(booking, 200);
    expect(booking.status).toBe("paid");
  });
});

describe("8. Paid booking cannot expire", () => {
  it("should reject expire on paid booking", () => {
    const booking = makeBooking({
      status: "paid",
      paidAt: new Date(),
      paymentDeadline: future(),
    });
    expect(() => expireBooking(booking)).toThrow(
      "Only pending bookings can expire",
    );
  });
});

describe("9. Checked-in ticket cannot be checked in again", () => {
  it("should reject duplicate check-in", () => {
    const ticket = createTicket(
      "t1",
      "b1",
      "e1",
      "Regular",
      "TCKT-001",
      createMoney(100),
      "checkedIn",
      "John",
      "j@m.com",
      new Date(),
      new Date(),
    );
    expect(() => checkInTicket(ticket, "e1")).toThrow("Ticket is not active");
  });
});

describe("10. Refund cannot be requested if ticket has already been checked in", () => {
  it("should reject refund on checked-in ticket", () => {
    const ticket = createTicket(
      "t1",
      "b1",
      "e1",
      "Regular",
      "TCKT-001",
      createMoney(100),
      "checkedIn",
      "John",
      "j@m.com",
      new Date(),
      new Date(),
    );
    expect(() => markTicketRefunded(ticket)).toThrow(
      "Only active tickets can be refunded",
    );
  });
});

describe("11. Refund cannot be approved if not in Requested status", () => {
  it("should reject approve on paidOut refund", () => {
    const refund = createRefund(
      "r1",
      "b1",
      createMoney(100),
      "Test",
      "paidOut",
      new Date(),
      new Date(),
      null,
      "ref-001",
    );
    expect(() => approveRefund(refund)).toThrow(
      "Only requested refunds can be approved",
    );
  });
});

describe("12. Rejected refund must have a rejection reason", () => {
  it("should store rejection reason", () => {
    const refund = createRefund(
      "r1",
      "b1",
      createMoney(100),
      "Test",
      "requested",
      new Date(),
      null,
      null,
      null,
    );
    rejectRefund(refund, "Outside refund period");
    expect(refund.status).toBe("rejected");
    expect(refund.rejectionReason).toBe("Outside refund period");
  });
});

describe("Event aggregate: creation & status", () => {
  it("should create event with draft status", () => {
    const event = makeEvent();
    expect(event.status).toBe("draft");
    expect(event.domainEvents.some((e) => e.eventType === "EventCreated")).toBe(
      true,
    );
  });
});

describe("Event aggregate: publish", () => {
  it("should publish event with active categories", () => {
    const event = makeEvent();
    publishEvent(event);
    expect(event.status).toBe("published");
    expect(
      event.domainEvents.some((e) => e.eventType === "EventPublished"),
    ).toBe(true);
  });
  it("should reject publish if already published", () => {
    const event = makeEvent({ status: "published" });
    expect(() => publishEvent(event)).toThrow(
      "Only draft events can be published",
    );
  });
});

describe("Event aggregate: cancel", () => {
  it("should cancel published event", () => {
    const event = makeEvent({ status: "published" });
    cancelEvent(event);
    expect(event.status).toBe("cancelled");
    expect(
      event.domainEvents.some((e) => e.eventType === "EventCancelled"),
    ).toBe(true);
  });
  it("should reject cancel completed event", () => {
    const event = makeEvent({ status: "completed" });
    expect(() => cancelEvent(event)).toThrow(
      "Completed events cannot be cancelled",
    );
  });
});

describe("Event aggregate: ticket category management", () => {
  it("should add new category", () => {
    const event = makeEvent({ maxCapacity: 200, startDate: future() });
    const cat = addCategory(
      event,
      "cat2",
      "VIP",
      createMoney(200),
      30,
      past(),
      new Date("2026-06-01"),
    );
    expect(cat.name).toBe("VIP");
    expect(
      event.domainEvents.some((e) => e.eventType === "TicketCategoryCreated"),
    ).toBe(true);
  });
  it("should disable category", () => {
    const cat = makeCategory();
    const event = makeEvent({ categories: [cat], status: "published" });
    disableCategory(event, cat.id);
    expect(cat.isActive).toBe(false);
    expect(
      event.domainEvents.some((e) => e.eventType === "TicketCategoryDisabled"),
    ).toBe(true);
  });
  it("should reject add category on cancelled event", () => {
    const event = makeEvent({ status: "cancelled" });
    expect(() =>
      addCategory(event, "cat2", "VIP", createMoney(200), 10, past(), future()),
    ).toThrow("Cannot add category");
  });
});

describe("Event aggregate: quota & capacity", () => {
  it("should calculate totalQuota", () => {
    const cats = [
      makeCategory({ quota: 50 }),
      makeCategory({ id: "c2", name: "VIP", quota: 30 }),
    ];
    const event = makeEvent({ categories: cats });
    expect(getTotalQuota(event)).toBe(80);
  });
  it("should calculate remainingCapacity", () => {
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

describe("Event aggregate: reserve & release tickets", () => {
  it("should reserve tickets from category", () => {
    const cat = makeCategory({ quota: 50 });
    const event = makeEvent({ status: "published", categories: [cat] });
    reserveCategory(event, "c1", 10);
    expect(cat.remaining).toBe(40);
  });
  it("should reject reserve beyond remaining", () => {
    const cat = makeCategory({ quota: 5 });
    const event = makeEvent({ status: "published", categories: [cat] });
    expect(() => reserveCategory(event, "c1", 10)).toThrow(
      "Insufficient remaining quota",
    );
  });
  it("should release tickets back to category", () => {
    const cat = makeCategory({ quota: 50 });
    const event = makeEvent({ status: "published", categories: [cat] });
    reserveCategory(event, "c1", 10);
    releaseCategory(event, "c1", 5);
    expect(cat.remaining).toBe(45);
  });
  it("should reject reserve on non-published event", () => {
    const event = makeEvent({ status: "draft" });
    expect(() => reserveCategory(event, "c1", 1)).toThrow(
      "Event is not published",
    );
  });
});

describe("Event aggregate: isBookable", () => {
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

describe("Event aggregate: getCategory", () => {
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

describe("Booking aggregate: creation", () => {
  it("should create with pending status", () => {
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
      createBooking(
        "b1",
        "e1",
        "c1",
        [],
        0,
        0,
        "pending",
        new Date(),
        null,
        future(),
      ),
    ).toThrow("Booking must have at least one item");
  });
  it("should calculate subtotal", () => {
    const booking = makeBooking();
    expect(getSubtotal(booking)).toBe(200);
  });
  it("should include service fee in total", () => {
    const items: BookingItem[] = [
      {
        ticketCategoryId: "c1",
        categoryName: "Regular",
        quantity: 2,
        unitPrice: 100,
      },
    ];
    const booking = createBooking(
      "b1",
      "e1",
      "c1",
      items,
      210,
      10,
      "pending",
      new Date(),
      null,
      future(),
    );
    expect(booking.totalAmount).toBe(210);
    expect(booking.serviceFee).toBe(10);
  });
});

describe("Booking aggregate: payment", () => {
  it("should accept correct payment on time", () => {
    const booking = makeBooking({ paymentDeadline: future() });
    payBooking(booking, 200);
    expect(booking.status).toBe("paid");
    expect(
      booking.domainEvents.some((e) => e.eventType === "BookingPaid"),
    ).toBe(true);
  });
  it("should reject payment on cancelled booking", () => {
    const booking = makeBooking({ status: "cancelled" });
    expect(() => payBooking(booking, 200)).toThrow(
      "Only pending bookings can be paid",
    );
  });
});

describe("Booking aggregate: cancel", () => {
  it("should cancel pending booking", () => {
    const booking = makeBooking();
    cancelBooking(booking);
    expect(booking.status).toBe("cancelled");
    expect(
      booking.domainEvents.some((e) => e.eventType === "BookingCancelled"),
    ).toBe(true);
  });
  it("should reject cancel on refunded booking", () => {
    const booking = makeBooking({ status: "refunded" });
    expect(() => cancelBooking(booking)).toThrow(
      "Booking is already finalised",
    );
  });
});

describe("Booking aggregate: expire", () => {
  it("should expire pending booking", () => {
    const booking = makeBooking();
    expireBooking(booking);
    expect(booking.status).toBe("expired");
    expect(
      booking.domainEvents.some((e) => e.eventType === "BookingExpired"),
    ).toBe(true);
  });
  it("should reject expire on paid booking", () => {
    const booking = makeBooking({
      status: "paid",
      paidAt: new Date(),
      paymentDeadline: future(),
    });
    expect(() => expireBooking(booking)).toThrow(
      "Only pending bookings can expire",
    );
  });
});

describe("Ticket: check-in", () => {
  it("should check in active ticket for correct event", () => {
    const ticket = createTicket(
      "t1",
      "b1",
      "e1",
      "Regular",
      "TCKT-001",
      createMoney(100),
      "active",
      "John",
      "j@m.com",
      new Date(),
      null,
    );
    checkInTicket(ticket, "e1");
    expect(ticket.status).toBe("checkedIn");
    expect(
      ticket.domainEvents.some((e) => e.eventType === "TicketCheckedIn"),
    ).toBe(true);
  });
  it("should reject wrong event", () => {
    const ticket = createTicket(
      "t1",
      "b1",
      "e1",
      "Regular",
      "TCKT-001",
      createMoney(100),
      "active",
      "John",
      "j@m.com",
      new Date(),
      null,
    );
    expect(() => checkInTicket(ticket, "e2")).toThrow(
      "Ticket does not match the event",
    );
  });
  it("should reject already checked-in ticket", () => {
    const ticket = createTicket(
      "t1",
      "b1",
      "e1",
      "Regular",
      "TCKT-001",
      createMoney(100),
      "checkedIn",
      "John",
      "j@m.com",
      new Date(),
      new Date(),
    );
    expect(() => checkInTicket(ticket, "e1")).toThrow("Ticket is not active");
  });
});

describe("Ticket: lifecycle", () => {
  it("should cancel active ticket", () => {
    const ticket = createTicket(
      "t1",
      "b1",
      "e1",
      "Regular",
      "TCKT-001",
      createMoney(100),
      "active",
      "John",
      "j@m.com",
      new Date(),
      null,
    );
    cancelTicket(ticket);
    expect(ticket.status).toBe("cancelled");
  });
  it("should mark active ticket as refunded", () => {
    const ticket = createTicket(
      "t1",
      "b1",
      "e1",
      "Regular",
      "TCKT-001",
      createMoney(100),
      "active",
      "John",
      "j@m.com",
      new Date(),
      null,
    );
    markTicketRefunded(ticket);
    expect(ticket.status).toBe("refunded");
  });
});

describe("Refund: lifecycle", () => {
  it("should create with requested status and raise event", () => {
    const refund = createRefund(
      "r1",
      "b1",
      createMoney(100),
      "Changed mind",
      "requested",
      new Date(),
      null,
      null,
      null,
    );
    expect(refund.status).toBe("requested");
    expect(
      refund.domainEvents.some((e) => e.eventType === "RefundRequested"),
    ).toBe(true);
  });
  it("should approve requested refund", () => {
    const refund = createRefund(
      "r1",
      "b1",
      createMoney(100),
      "Test",
      "requested",
      new Date(),
      null,
      null,
      null,
    );
    approveRefund(refund);
    expect(refund.status).toBe("approved");
    expect(
      refund.domainEvents.some((e) => e.eventType === "RefundApproved"),
    ).toBe(true);
  });
  it("should reject with reason", () => {
    const refund = createRefund(
      "r1",
      "b1",
      createMoney(100),
      "Test",
      "requested",
      new Date(),
      null,
      null,
      null,
    );
    rejectRefund(refund, "Outside refund period");
    expect(refund.rejectionReason).toBe("Outside refund period");
    expect(
      refund.domainEvents.some((e) => e.eventType === "RefundRejected"),
    ).toBe(true);
  });
  it("should payout approved refund with reference", () => {
    const refund = createRefund(
      "r1",
      "b1",
      createMoney(100),
      "Test",
      "approved",
      new Date(),
      new Date(),
      null,
      null,
    );
    payoutRefund(refund, "PAY-REF-001");
    expect(refund.status).toBe("paidOut");
    expect(refund.paymentReference).toBe("PAY-REF-001");
    expect(
      refund.domainEvents.some((e) => e.eventType === "RefundPaidOut"),
    ).toBe(true);
  });
});

describe("PromoCode: validation", () => {
  it("should apply percentage discount", () => {
    const period = createDateRange(past(), future());
    const promo = createPromoCode(
      "p1",
      "DISC10",
      "percentage",
      10,
      100,
      0,
      createMoney(0),
      period,
      true,
    );
    const r = validatePromoCode(promo, createMoney(200));
    expect(r.valid).toBe(true);
    expect(r.discountAmount).toBe(20);
    expect(r.finalAmount).toBe(180);
  });
  it("should reject expired promo", () => {
    const period = createDateRange(
      new Date("2020-01-01"),
      new Date("2021-12-31"),
    );
    const promo = createPromoCode(
      "p1",
      "EXPIRED",
      "fixed",
      50,
      100,
      0,
      createMoney(0),
      period,
      true,
    );
    expect(validatePromoCode(promo, createMoney(200)).valid).toBe(false);
  });
  it("should deactivate promo code", () => {
    const period = createDateRange(past(), future());
    const promo = createPromoCode(
      "p1",
      "ACTIVE",
      "fixed",
      50,
      100,
      0,
      createMoney(0),
      period,
      true,
    );
    deactivatePromoCode(promo);
    expect(promo.isActive).toBe(false);
  });
});

describe("User registration", () => {
  it("should create user with valid email", () => {
    const user = createUser(
      "u1",
      "John",
      createEmail("john@mail.com"),
      "customer",
      new Date(),
    );
    expect(user.role).toBe("customer");
  });
  it("should reject invalid email", () => {
    expect(() => createEmail("invalid")).toThrow();
  });
});

describe("TicketCategory: sales status", () => {
  it("should detect soldOut", () => {
    const cat = makeCategory({ remaining: 0 });
    expect(getSalesStatus(cat)).toBe("soldOut");
  });
  it("should detect comingSoon", () => {
    const later = new Date(Date.now() + 86400000);
    const cat = makeCategory({ salesStart: later });
    expect(getSalesStatus(cat)).toBe("comingSoon");
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
});

describe("Event: ticket category sales period must end before event start", () => {
  it("should reject addCategory when sales end > event start", () => {
    const event = makeEvent({ startDate: new Date("2026-06-01") });
    expect(() =>
      addCategory(
        event,
        "cat2",
        "VIP",
        createMoney(200),
        10,
        past(),
        new Date("2026-07-01"),
      ),
    ).toThrow("Sales period must end before or at the event start date");
  });
  it("should accept addCategory when sales end <= event start", () => {
    const event = makeEvent({ startDate: new Date("2026-07-01") });
    const cat = addCategory(
      event,
      "cat2",
      "VIP",
      createMoney(200),
      10,
      past(),
      new Date("2026-06-01"),
    );
    expect(cat.name).toBe("VIP");
  });
});

describe("Booking: payment deadline validation", () => {
  it("should reject payment deadline before creation time", () => {
    const now = new Date();
    const pastDeadline = new Date(now.getTime() - 1000);
    expect(() =>
      createBooking(
        "b1",
        "e1",
        "c1",
        [
          {
            ticketCategoryId: "c1",
            categoryName: "Reg",
            quantity: 1,
            unitPrice: 100,
          },
        ],
        100,
        0,
        "pending",
        now,
        null,
        pastDeadline,
      ),
    ).toThrow("Payment deadline must be after creation time");
  });
});

describe("Booking: multiple items calculation", () => {
  it("should calculate subtotal from multiple items", () => {
    const items: BookingItem[] = [
      {
        ticketCategoryId: "c1",
        categoryName: "Regular",
        quantity: 2,
        unitPrice: 100,
      },
      {
        ticketCategoryId: "c2",
        categoryName: "VIP",
        quantity: 1,
        unitPrice: 200,
      },
    ];
    const booking = createBooking(
      "b1",
      "e1",
      "c1",
      items,
      400,
      0,
      "pending",
      new Date(),
      null,
      future(),
    );
    expect(getSubtotal(booking)).toBe(400);
  });
  it("should include service fee in total", () => {
    const items: BookingItem[] = [
      {
        ticketCategoryId: "c1",
        categoryName: "Regular",
        quantity: 2,
        unitPrice: 100,
      },
    ];
    const booking = createBooking(
      "b1",
      "e1",
      "c1",
      items,
      210,
      10,
      "pending",
      new Date(),
      null,
      future(),
    );
    expect(booking.totalAmount).toBe(210);
  });
});

import { DomainEvent } from "./domain-event";
import { Money } from "../value-objects/money";

export class EventCreated implements DomainEvent {
  readonly eventType = "EventCreated";
  readonly occurredAt = new Date();
  constructor(
    public readonly eventId: string,
    public readonly organizerId: string,
  ) {}
}

export class EventPublished implements DomainEvent {
  readonly eventType = "EventPublished";
  readonly occurredAt = new Date();
  constructor(public readonly eventId: string) {}
}

export class EventCancelled implements DomainEvent {
  readonly eventType = "EventCancelled";
  readonly occurredAt = new Date();
  constructor(public readonly eventId: string) {}
}

export class TicketCategoryCreated implements DomainEvent {
  readonly eventType = "TicketCategoryCreated";
  readonly occurredAt = new Date();
  constructor(
    public readonly eventId: string,
    public readonly categoryId: string,
  ) {}
}

export class TicketCategoryDisabled implements DomainEvent {
  readonly eventType = "TicketCategoryDisabled";
  readonly occurredAt = new Date();
  constructor(
    public readonly eventId: string,
    public readonly categoryId: string,
  ) {}
}

export class BookingCreated implements DomainEvent {
  readonly eventType = "BookingCreated";
  readonly occurredAt = new Date();
  constructor(
    public readonly bookingId: string,
    public readonly eventId: string,
    public readonly customerId: string,
    public readonly totalAmount: number,
  ) {}
}

export class BookingPaid implements DomainEvent {
  readonly eventType = "BookingPaid";
  readonly occurredAt = new Date();
  constructor(
    public readonly bookingId: string,
    public readonly amount: number,
  ) {}
}

export class BookingCancelled implements DomainEvent {
  readonly eventType = "BookingCancelled";
  readonly occurredAt = new Date();
  constructor(public readonly bookingId: string) {}
}

export class BookingExpired implements DomainEvent {
  readonly eventType = "BookingExpired";
  readonly occurredAt = new Date();
  constructor(public readonly bookingId: string) {}
}

export class TicketReserved implements DomainEvent {
  readonly eventType = "TicketReserved";
  readonly occurredAt = new Date();
  constructor(
    public readonly bookingId: string,
    public readonly eventId: string,
    public readonly quantity: number,
  ) {}
}

export class TicketCheckedIn implements DomainEvent {
  readonly eventType = "TicketCheckedIn";
  readonly occurredAt = new Date();
  constructor(
    public readonly ticketId: string,
    public readonly ticketCode: string,
  ) {}
}

export class RefundRequested implements DomainEvent {
  readonly eventType = "RefundRequested";
  readonly occurredAt = new Date();
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
  ) {}
}

export class RefundApproved implements DomainEvent {
  readonly eventType = "RefundApproved";
  readonly occurredAt = new Date();
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
  ) {}
}

export class RefundRejected implements DomainEvent {
  readonly eventType = "RefundRejected";
  readonly occurredAt = new Date();
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly reason: string,
  ) {}
}

export class RefundPaidOut implements DomainEvent {
  readonly eventType = "RefundPaidOut";
  readonly occurredAt = new Date();
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly paymentReference: string,
  ) {}
}

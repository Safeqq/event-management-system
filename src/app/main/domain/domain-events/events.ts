import { DomainEvent } from "./domain-event";

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

export class TicketReserved implements DomainEvent {
  readonly eventType = "TicketReserved";
  readonly occurredAt = new Date();
  constructor(
    public readonly bookingId: string,
    public readonly eventId: string,
    public readonly quantity: number,
  ) {}
}

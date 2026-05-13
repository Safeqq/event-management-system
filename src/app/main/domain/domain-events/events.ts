import type { DomainEvent } from "./domain-event";

export interface EventCreated extends DomainEvent {
  readonly eventType: "EventCreated";
  readonly eventId: string;
  readonly organizerId: string;
}

export const createEventCreated = (
  eventId: string,
  organizerId: string,
): EventCreated => ({
  occurredAt: new Date(),
  eventType: "EventCreated",
  eventId,
  organizerId,
});

export interface EventPublished extends DomainEvent {
  readonly eventType: "EventPublished";
  readonly eventId: string;
}

export const createEventPublished = (eventId: string): EventPublished => ({
  occurredAt: new Date(),
  eventType: "EventPublished",
  eventId,
});

export interface EventCancelled extends DomainEvent {
  readonly eventType: "EventCancelled";
  readonly eventId: string;
}

export const createEventCancelled = (eventId: string): EventCancelled => ({
  occurredAt: new Date(),
  eventType: "EventCancelled",
  eventId,
});

export interface TicketCategoryCreated extends DomainEvent {
  readonly eventType: "TicketCategoryCreated";
  readonly eventId: string;
  readonly categoryId: string;
}

export const createTicketCategoryCreated = (
  eventId: string,
  categoryId: string,
): TicketCategoryCreated => ({
  occurredAt: new Date(),
  eventType: "TicketCategoryCreated",
  eventId,
  categoryId,
});

export interface TicketCategoryDisabled extends DomainEvent {
  readonly eventType: "TicketCategoryDisabled";
  readonly eventId: string;
  readonly categoryId: string;
}

export const createTicketCategoryDisabled = (
  eventId: string,
  categoryId: string,
): TicketCategoryDisabled => ({
  occurredAt: new Date(),
  eventType: "TicketCategoryDisabled",
  eventId,
  categoryId,
});

export interface BookingCreated extends DomainEvent {
  readonly eventType: "BookingCreated";
  readonly bookingId: string;
  readonly eventId: string;
  readonly customerId: string;
  readonly totalAmount: number;
}

export const createBookingCreated = (
  bookingId: string,
  eventId: string,
  customerId: string,
  totalAmount: number,
): BookingCreated => ({
  occurredAt: new Date(),
  eventType: "BookingCreated",
  bookingId,
  eventId,
  customerId,
  totalAmount,
});

export interface BookingPaid extends DomainEvent {
  readonly eventType: "BookingPaid";
  readonly bookingId: string;
  readonly amount: number;
}

export const createBookingPaid = (
  bookingId: string,
  amount: number,
): BookingPaid => ({
  occurredAt: new Date(),
  eventType: "BookingPaid",
  bookingId,
  amount,
});

export interface BookingCancelled extends DomainEvent {
  readonly eventType: "BookingCancelled";
  readonly bookingId: string;
}

export const createBookingCancelled = (
  bookingId: string,
): BookingCancelled => ({
  occurredAt: new Date(),
  eventType: "BookingCancelled",
  bookingId,
});

export interface BookingExpired extends DomainEvent {
  readonly eventType: "BookingExpired";
  readonly bookingId: string;
}

export const createBookingExpired = (bookingId: string): BookingExpired => ({
  occurredAt: new Date(),
  eventType: "BookingExpired",
  bookingId,
});

export interface TicketReserved extends DomainEvent {
  readonly eventType: "TicketReserved";
  readonly bookingId: string;
  readonly eventId: string;
  readonly quantity: number;
}

export const createTicketReserved = (
  bookingId: string,
  eventId: string,
  quantity: number,
): TicketReserved => ({
  occurredAt: new Date(),
  eventType: "TicketReserved",
  bookingId,
  eventId,
  quantity,
});

export interface TicketCheckedIn extends DomainEvent {
  readonly eventType: "TicketCheckedIn";
  readonly ticketId: string;
  readonly ticketCode: string;
}

export const createTicketCheckedIn = (
  ticketId: string,
  ticketCode: string,
): TicketCheckedIn => ({
  occurredAt: new Date(),
  eventType: "TicketCheckedIn",
  ticketId,
  ticketCode,
});

export interface RefundRequested extends DomainEvent {
  readonly eventType: "RefundRequested";
  readonly refundId: string;
  readonly bookingId: string;
}

export const createRefundRequested = (
  refundId: string,
  bookingId: string,
): RefundRequested => ({
  occurredAt: new Date(),
  eventType: "RefundRequested",
  refundId,
  bookingId,
});

export interface RefundApproved extends DomainEvent {
  readonly eventType: "RefundApproved";
  readonly refundId: string;
  readonly bookingId: string;
}

export const createRefundApproved = (
  refundId: string,
  bookingId: string,
): RefundApproved => ({
  occurredAt: new Date(),
  eventType: "RefundApproved",
  refundId,
  bookingId,
});

export interface RefundRejected extends DomainEvent {
  readonly eventType: "RefundRejected";
  readonly refundId: string;
  readonly bookingId: string;
  readonly reason: string;
}

export const createRefundRejected = (
  refundId: string,
  bookingId: string,
  reason: string,
): RefundRejected => ({
  occurredAt: new Date(),
  eventType: "RefundRejected",
  refundId,
  bookingId,
  reason,
});

export interface RefundPaidOut extends DomainEvent {
  readonly eventType: "RefundPaidOut";
  readonly refundId: string;
  readonly bookingId: string;
  readonly paymentReference: string;
}

export const createRefundPaidOut = (
  refundId: string,
  bookingId: string,
  paymentReference: string,
): RefundPaidOut => ({
  occurredAt: new Date(),
  eventType: "RefundPaidOut",
  refundId,
  bookingId,
  paymentReference,
});

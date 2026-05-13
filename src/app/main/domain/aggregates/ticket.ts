import { type Aggregate, addDomainEvent } from "./aggregate-root";
import { createTicketCheckedIn } from "../domain-events/events";
import type { Money } from "../value-objects/money";
import type { DomainEvent } from "../domain-events/domain-event";

export type TicketStatus = "active" | "checkedIn" | "refunded" | "cancelled";

export interface TicketState extends Aggregate {
  id: string;
  bookingId: string;
  eventId: string;
  categoryName: string;
  code: string;
  price: Money;
  status: TicketStatus;
  customerName: string;
  customerEmail: string;
  createdAt: Date;
  checkedInAt: Date | null;
  domainEvents: DomainEvent[];
}

export const createTicket = (
  id: string,
  bookingId: string,
  eventId: string,
  categoryName: string,
  code: string,
  price: Money,
  status: TicketStatus,
  customerName: string,
  customerEmail: string,
  createdAt: Date,
  checkedInAt: Date | null,
): TicketState => ({
  id,
  bookingId,
  eventId,
  categoryName,
  code,
  price,
  status,
  customerName,
  customerEmail,
  createdAt,
  checkedInAt,
  domainEvents: [],
});

export const checkInTicket = (ticket: TicketState, eventId: string): void => {
  if (ticket.eventId !== eventId)
    throw new Error("Ticket does not match the event");
  if (ticket.status !== "active") throw new Error("Ticket is not active");
  ticket.status = "checkedIn";
  ticket.checkedInAt = new Date();
  addDomainEvent(ticket, createTicketCheckedIn(ticket.id, ticket.code));
};

export const markTicketRefunded = (ticket: TicketState): void => {
  if (ticket.status !== "active")
    throw new Error("Only active tickets can be refunded");
  ticket.status = "refunded";
};

export const cancelTicket = (ticket: TicketState): void => {
  if (ticket.status !== "active")
    throw new Error("Only active tickets can be cancelled");
  ticket.status = "cancelled";
};

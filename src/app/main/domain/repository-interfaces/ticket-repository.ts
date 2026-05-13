import type { TicketState } from "../aggregates/ticket";

export interface TicketRepository {
  findById(id: string): Promise<TicketState | null>;
  findByBooking(bookingId: string): Promise<TicketState[]>;
  findByEvent(eventId: string): Promise<TicketState[]>;
  findByCustomer(customerEmail: string): Promise<TicketState[]>;
  findByCode(code: string): Promise<TicketState | null>;
  save(ticket: TicketState): Promise<void>;
  update(ticket: TicketState): Promise<void>;
}

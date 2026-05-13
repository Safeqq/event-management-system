import { Ticket } from "../aggregates/ticket";

export interface TicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByBooking(bookingId: string): Promise<Ticket[]>;
  findByEvent(eventId: string): Promise<Ticket[]>;
  findByCustomer(customerEmail: string): Promise<Ticket[]>;
  findByCode(code: string): Promise<Ticket | null>;
  save(ticket: Ticket): Promise<void>;
  update(ticket: Ticket): Promise<void>;
}

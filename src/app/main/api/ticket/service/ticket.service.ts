import { Ticket } from "../../../domain/entities/ticket";

export interface TicketService {
  checkIn(ticketCode: string, eventId: string): Promise<Ticket>;
  getByCustomer(customerEmail: string): Promise<Ticket[]>;
}

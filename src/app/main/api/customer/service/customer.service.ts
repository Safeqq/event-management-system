import { Booking } from "../../../domain/entities/booking";
import { Ticket } from "../../../domain/entities/ticket";

export interface CustomerService {
  getBookings(customerId: string): Promise<Booking[]>;
  getTickets(customerEmail: string): Promise<Ticket[]>;
}

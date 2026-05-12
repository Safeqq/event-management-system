import { Booking } from "../../../domain/aggregates/booking";
import { Money } from "../../../domain/value-objects/money";

export interface CreateBookingInput {
  eventId: string;
  customerId: string;
  items: { ticketCategoryId: string; quantity: number }[];
}

export interface BookingService {
  create(input: CreateBookingInput): Promise<Booking>;
  pay(bookingId: string, amount: Money): Promise<void>;
  cancel(bookingId: string): Promise<void>;
  expire(bookingId: string): Promise<void>;
}

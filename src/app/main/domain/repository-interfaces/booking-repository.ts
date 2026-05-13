import type { BookingState } from "../aggregates/booking";

export interface BookingRepository {
  findById(id: string): Promise<BookingState | null>;
  findByCustomer(customerId: string): Promise<BookingState[]>;
  findByEvent(eventId: string): Promise<BookingState[]>;
  save(booking: BookingState): Promise<void>;
  update(booking: BookingState): Promise<void>;
}

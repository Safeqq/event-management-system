import { Booking } from "../../../domain/aggregates/booking";

export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByCustomer(customerId: string): Promise<Booking[]>;
  findByEvent(eventId: string): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
  update(booking: Booking): Promise<void>;
}

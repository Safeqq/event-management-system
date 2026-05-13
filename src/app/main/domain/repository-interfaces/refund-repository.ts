import { Refund } from "../aggregates/refund";

export interface RefundRepository {
  findById(id: string): Promise<Refund | null>;
  findByBooking(bookingId: string): Promise<Refund[]>;
  save(refund: Refund): Promise<void>;
  update(refund: Refund): Promise<void>;
}

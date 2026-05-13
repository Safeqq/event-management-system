import type { RefundState } from "../aggregates/refund";

export interface RefundRepository {
  findById(id: string): Promise<RefundState | null>;
  findByBooking(bookingId: string): Promise<RefundState[]>;
  save(refund: RefundState): Promise<void>;
  update(refund: RefundState): Promise<void>;
}

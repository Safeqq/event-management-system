import { Refund } from "../../../domain/entities/refund";

export interface RefundService {
  request(bookingId: string): Promise<Refund>;
  approve(refundId: string): Promise<void>;
  reject(refundId: string, reason: string): Promise<void>;
  payout(refundId: string): Promise<void>;
}

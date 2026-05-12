import { Entity } from "./entity";
import { Money } from "../value-objects/money";

export type RefundStatus = "requested" | "approved" | "rejected" | "paid_out";

export class Refund extends Entity {
  constructor(
    public readonly id: string,
    public bookingId: string,
    public amount: Money,
    public reason: string,
    public status: RefundStatus,
    public readonly requestedAt: Date,
    public resolvedAt: Date | null,
    public rejectionReason: string | null,
  ) {
    super(id);
  }
}

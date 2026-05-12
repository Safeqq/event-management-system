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

  approve(): void {
    if (this.status !== "requested") throw new Error("Only requested refunds can be approved");
    this.status = "approved";
    this.resolvedAt = new Date();
  }

  reject(reason: string): void {
    if (this.status !== "requested") throw new Error("Only requested refunds can be rejected");
    this.status = "rejected";
    this.resolvedAt = new Date();
    this.rejectionReason = reason;
  }

  payout(): void {
    if (this.status !== "approved") throw new Error("Only approved refunds can be paid out");
    this.status = "paid_out";
  }
}

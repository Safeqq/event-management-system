import { type Aggregate, addDomainEvent } from "./aggregate-root";
import {
  createRefundRequested, createRefundApproved, createRefundRejected, createRefundPaidOut,
} from "../domain-events/events";
import type { Money } from "../value-objects/money";
import type { DomainEvent } from "../domain-events/domain-event";

export type RefundStatus = "requested" | "approved" | "rejected" | "paidOut";

export interface RefundState extends Aggregate {
  id: string;
  bookingId: string;
  amount: Money;
  reason: string;
  status: RefundStatus;
  requestedAt: Date;
  resolvedAt: Date | null;
  rejectionReason: string | null;
  paymentReference: string | null;
  domainEvents: DomainEvent[];
}

export const createRefund = (
  id: string, bookingId: string, amount: Money, reason: string,
  status: RefundStatus, requestedAt: Date, resolvedAt: Date | null,
  rejectionReason: string | null, paymentReference: string | null,
): RefundState => {
  const refund: RefundState = {
    id, bookingId, amount, reason, status, requestedAt,
    resolvedAt, rejectionReason, paymentReference, domainEvents: [],
  };
  if (status === "requested") {
    addDomainEvent(refund, createRefundRequested(id, bookingId));
  }
  return refund;
};

export const approveRefund = (refund: RefundState): void => {
  if (refund.status !== "requested") throw new Error("Only requested refunds can be approved");
  refund.status = "approved";
  refund.resolvedAt = new Date();
  addDomainEvent(refund, createRefundApproved(refund.id, refund.bookingId));
};

export const rejectRefund = (refund: RefundState, reason: string): void => {
  if (refund.status !== "requested") throw new Error("Only requested refunds can be rejected");
  refund.status = "rejected";
  refund.resolvedAt = new Date();
  refund.rejectionReason = reason;
  addDomainEvent(refund, createRefundRejected(refund.id, refund.bookingId, reason));
};

export const payoutRefund = (refund: RefundState, paymentReference: string): void => {
  if (refund.status !== "approved") throw new Error("Only approved refunds can be paid out");
  refund.status = "paidOut";
  refund.paymentReference = paymentReference;
  addDomainEvent(refund, createRefundPaidOut(refund.id, refund.bookingId, paymentReference));
};

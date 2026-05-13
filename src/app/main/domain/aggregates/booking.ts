import { AggregateRoot } from "./aggregate-root";
import {
  BookingCreated,
  BookingPaid,
  BookingCancelled,
  BookingExpired,
} from "../domain-events/events";

export type BookingStatus = "pending" | "paid" | "cancelled" | "expired" | "refunded";

export interface BookingItem {
  ticketCategoryId: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
}

export class Booking extends AggregateRoot {
  constructor(
    public readonly id: string,
    public eventId: string,
    public customerId: string,
    public items: BookingItem[],
    public totalAmount: number,
    public serviceFee: number,
    public status: BookingStatus,
    public readonly createdAt: Date,
    public paidAt: Date | null,
    public readonly paymentDeadline: Date,
  ) {
    super();
    if (items.length === 0) throw new Error("Booking must have at least one item");
    for (const item of items) {
      if (item.quantity <= 0) throw new Error("Ticket quantity must be greater than zero");
    }
    this.addDomainEvent(new BookingCreated(this.id, this.eventId, this.customerId, this.totalAmount));
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  pay(amount: number): void {
    if (this.status !== "pending") throw new Error("Only pending bookings can be paid");
    if (new Date() > this.paymentDeadline) throw new Error("Payment deadline has passed");
    if (amount < this.totalAmount) throw new Error("Payment amount must equal total booking price");
    this.status = "paid";
    this.paidAt = new Date();
    this.addDomainEvent(new BookingPaid(this.id, this.totalAmount));
  }

  cancel(): void {
    if (this.status === "cancelled" || this.status === "refunded") throw new Error("Booking is already finalised");
    this.status = "cancelled";
    this.addDomainEvent(new BookingCancelled(this.id));
  }

  expire(): void {
    if (this.status !== "pending") throw new Error("Only pending bookings can expire");
    this.status = "expired";
    this.addDomainEvent(new BookingExpired(this.id));
  }

  markRefunded(): void {
    if (this.status !== "paid") throw new Error("Only paid bookings can be refunded");
    this.status = "refunded";
  }
}

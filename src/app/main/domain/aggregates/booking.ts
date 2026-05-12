import { AggregateRoot } from "./aggregate-root";
import { BookingCreated, BookingPaid, BookingCancelled } from "../domain-events/events";

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
    public status: BookingStatus,
    public readonly createdAt: Date,
    public paidAt: Date | null,
  ) {
    super();
    this.addDomainEvent(new BookingCreated(this.id, this.eventId, this.customerId, this.totalAmount));
  }

  pay(amount: number): void {
    if (this.status !== "pending") throw new Error("Only pending bookings can be paid");
    if (amount < this.totalAmount) throw new Error("Insufficient payment amount");
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
  }

  markRefunded(): void {
    if (this.status !== "paid") throw new Error("Only paid bookings can be refunded");
    this.status = "refunded";
  }
}

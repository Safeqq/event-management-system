import { AggregateRoot } from "./aggregate-root";

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
  }
}

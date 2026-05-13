import { Entity } from "../entities/entity";
import { Money } from "../value-objects/money";

export type TicketStatus = "active" | "checkedIn" | "refunded" | "cancelled";

export class Ticket extends Entity {
  constructor(
    public readonly id: string,
    public bookingId: string,
    public eventId: string,
    public categoryName: string,
    public code: string,
    public price: Money,
    public status: TicketStatus,
    public customerName: string,
    public customerEmail: string,
    public readonly createdAt: Date,
    public checkedInAt: Date | null,
  ) {
    super(id);
  }

  checkIn(eventId: string): void {
    if (this.eventId !== eventId) throw new Error("Ticket does not match the event");
    if (this.status !== "active") throw new Error("Ticket is not active");
    this.status = "checkedIn";
    this.checkedInAt = new Date();
  }

  markRefunded(): void {
    if (this.status !== "active") throw new Error("Only active tickets can be refunded");
    this.status = "refunded";
  }

  cancel(): void {
    if (this.status !== "active") throw new Error("Only active tickets can be cancelled");
    this.status = "cancelled";
  }
}

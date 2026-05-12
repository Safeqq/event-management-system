import { Entity } from "./entity";
import { TicketCode } from "../value-objects/ticket-code";
import { Money } from "../value-objects/money";

export type TicketStatus = "active" | "used" | "refunded" | "cancelled";

export class Ticket extends Entity {
  constructor(
    public readonly id: string,
    public bookingId: string,
    public eventId: string,
    public categoryName: string,
    public code: TicketCode,
    public price: Money,
    public status: TicketStatus,
    public customerName: string,
    public customerEmail: string,
    public readonly createdAt: Date,
    public checkedInAt: Date | null,
  ) {
    super(id);
  }
}

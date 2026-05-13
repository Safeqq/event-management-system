import { Entity } from "./entity";
import { Money } from "../value-objects/money";

export type SalesStatus = "active" | "comingSoon" | "salesClosed" | "soldOut";

export class TicketCategory extends Entity {
  constructor(
    public readonly id: string,
    public name: string,
    public price: Money,
    public quota: number,
    public salesStart: Date,
    public salesEnd: Date,
    public isActive: boolean,
    public remaining: number = quota,
  ) {
    super(id);
    if (price.amount < 0) throw new Error("Ticket price cannot be negative");
    if (quota <= 0) throw new Error("Ticket quota must be greater than zero");
    if (salesEnd < salesStart) throw new Error("Sales end must be after sales start");
  }

  get salesStatus(): SalesStatus {
    const now = new Date();
    if (this.remaining <= 0) return "soldOut";
    if (now < this.salesStart) return "comingSoon";
    if (now > this.salesEnd) return "salesClosed";
    if (!this.isActive) return "salesClosed";
    return "active";
  }

  deactivate(): void {
    this.isActive = false;
  }

  reserve(quantity: number): void {
    if (quantity > this.remaining) throw new Error("Insufficient remaining quota");
    this.remaining -= quantity;
  }

  release(quantity: number): void {
    this.remaining += quantity;
  }
}

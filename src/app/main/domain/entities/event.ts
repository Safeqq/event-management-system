import { Entity } from "./entity";

export type EventStatus = "draft" | "published" | "cancelled";

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  capacity: number;
  remaining: number;
}

export class Event extends Entity {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public date: Date,
    public location: string,
    public status: EventStatus,
    public categories: TicketCategory[],
    public organizerId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    super(id);
  }

  publish(): void {
    if (this.status !== "draft") throw new Error("Only draft events can be published");
    if (this.categories.length === 0) throw new Error("Event must have at least one ticket category");
    this.status = "published";
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this.status === "cancelled") throw new Error("Event is already cancelled");
    this.status = "cancelled";
    this.updatedAt = new Date();
  }
}

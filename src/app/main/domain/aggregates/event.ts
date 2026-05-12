import { AggregateRoot } from "./aggregate-root";
import { EventCreated, EventPublished, EventCancelled } from "../domain-events/events";

export type EventStatus = "draft" | "published" | "cancelled";

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  capacity: number;
  remaining: number;
}

export class Event extends AggregateRoot {
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
    super();
    this.addDomainEvent(new EventCreated(this.id, this.organizerId));
  }

  publish(): void {
    if (this.status !== "draft") throw new Error("Only draft events can be published");
    if (this.categories.length === 0) throw new Error("Event must have at least one ticket category");
    this.status = "published";
    this.updatedAt = new Date();
    this.addDomainEvent(new EventPublished(this.id));
  }

  cancel(): void {
    if (this.status === "cancelled") throw new Error("Event is already cancelled");
    this.status = "cancelled";
    this.updatedAt = new Date();
    this.addDomainEvent(new EventCancelled(this.id));
  }
}

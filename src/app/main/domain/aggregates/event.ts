import { AggregateRoot } from "./aggregate-root";

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
  }
}

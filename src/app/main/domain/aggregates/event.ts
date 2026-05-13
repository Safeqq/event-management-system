import { AggregateRoot } from "./aggregate-root";
import {
  EventCreated,
  EventPublished,
  EventCancelled,
  TicketCategoryCreated,
  TicketCategoryDisabled,
} from "../domain-events/events";
import { TicketCategory } from "../entities/ticket-category";
import { Money } from "../value-objects/money";

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export class Event extends AggregateRoot {
  private _categories: TicketCategory[];

  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public startDate: Date,
    public endDate: Date,
    public location: string,
    public maxCapacity: number,
    public status: EventStatus,
    categories: TicketCategory[],
    public organizerId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {
    super();
    if (endDate < startDate) throw new Error("End date cannot be earlier than start date");
    if (maxCapacity <= 0) throw new Error("Maximum capacity must be greater than zero");
    this._categories = categories;
    this.addDomainEvent(new EventCreated(this.id, this.organizerId));
  }

  get totalQuota(): number {
    return this._categories.reduce((sum, c) => sum + c.quota, 0);
  }

  get remainingCapacity(): number {
    return this._categories.reduce((sum, c) => sum + c.remaining, 0);
  }

  get isBookable(): boolean {
    if (this.status !== "published") return false;
    if (new Date() > this.endDate) return false;
    return this._categories.some((c) => c.isActive && c.remaining > 0);
  }

  getCategory(categoryId: string): TicketCategory | undefined {
    return this._categories.find((c) => c.id === categoryId);
  }

  publish(): void {
    if (this.status !== "draft") throw new Error("Only draft events can be published");
    if (this._categories.filter((c) => c.isActive).length === 0) {
      throw new Error("Event must have at least one active ticket category");
    }
    if (this.totalQuota > this.maxCapacity) throw new Error("Total ticket quota cannot exceed event capacity");
    this.status = "published";
    this.updatedAt = new Date();
    this.addDomainEvent(new EventPublished(this.id));
  }

  cancel(): void {
    if (this.status === "completed") throw new Error("Completed events cannot be cancelled");
    if (this.status === "cancelled") throw new Error("Event is already cancelled");
    this.status = "cancelled";
    this.updatedAt = new Date();
    this.addDomainEvent(new EventCancelled(this.id));
  }

  addCategory(name: string, price: Money, quota: number, salesStart: Date, salesEnd: Date): TicketCategory {
    if (this.status !== "draft" && this.status !== "published") throw new Error("Cannot add category to this event");
    const category = new TicketCategory(
      crypto.randomUUID(),
      name,
      price,
      quota,
      salesStart,
      salesEnd,
      true,
    );
    if (this.totalQuota + quota > this.maxCapacity) throw new Error("Total ticket quota cannot exceed event capacity");
    this._categories.push(category);
    this.addDomainEvent(new TicketCategoryCreated(this.id, category.id));
    return category;
  }

  disableCategory(categoryId: string): void {
    if (this.status === "completed") throw new Error("Cannot disable category on completed event");
    const category = this._categories.find((c) => c.id === categoryId);
    if (!category) throw new Error("Ticket category not found");
    category.deactivate();
    this.addDomainEvent(new TicketCategoryDisabled(this.id, categoryId));
  }

  reserveCategory(categoryId: string, quantity: number): void {
    if (this.status !== "published") throw new Error("Event is not published");
    const category = this._categories.find((c) => c.id === categoryId);
    if (!category) throw new Error("Ticket category not found");
    if (!category.isActive) throw new Error("Ticket category is not active");
    if (category.salesStatus !== "active") throw new Error("Ticket category is not available for sale");
    category.reserve(quantity);
  }

  releaseCategory(categoryId: string, quantity: number): void {
    const category = this._categories.find((c) => c.id === categoryId);
    if (!category) throw new Error("Ticket category not found");
    category.release(quantity);
  }
}

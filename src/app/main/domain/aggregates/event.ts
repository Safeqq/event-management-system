import type { Aggregate } from "./aggregate-root";
import { addDomainEvent } from "./aggregate-root";
import {
  createEventCreated, createEventPublished, createEventCancelled,
  createTicketCategoryCreated, createTicketCategoryDisabled,
} from "../domain-events/events";
import type { TicketCategoryState } from "../entities/ticket-category";
import { createTicketCategory, deactivateCategory, reserveCategoryQuota, releaseCategoryQuota, getSalesStatus } from "../entities/ticket-category";
import type { Money } from "../value-objects/money";
import type { DomainEvent } from "../domain-events/domain-event";

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export interface EventState extends Aggregate {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxCapacity: number;
  status: EventStatus;
  categories: TicketCategoryState[];
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
  domainEvents: DomainEvent[];
}

export const createEvent = (
  id: string, title: string, description: string, startDate: Date, endDate: Date,
  location: string, maxCapacity: number, status: EventStatus,
  categories: TicketCategoryState[], organizerId: string, createdAt: Date, updatedAt: Date,
): EventState => {
  if (endDate < startDate) throw new Error("End date cannot be earlier than start date");
  if (maxCapacity <= 0) throw new Error("Maximum capacity must be greater than zero");
  const event: EventState = {
    id, title, description, startDate, endDate, location, maxCapacity,
    status, categories, organizerId, createdAt, updatedAt, domainEvents: [],
  };
  addDomainEvent(event, createEventCreated(id, organizerId));
  return event;
};

export const getTotalQuota = (event: EventState): number =>
  event.categories.reduce((sum, c) => sum + c.quota, 0);

export const getRemainingCapacity = (event: EventState): number =>
  event.categories.reduce((sum, c) => sum + c.remaining, 0);

export const isBookable = (event: EventState): boolean => {
  if (event.status !== "published") return false;
  if (new Date() > event.endDate) return false;
  return event.categories.some((c) => c.isActive && c.remaining > 0);
};

export const getCategory = (event: EventState, categoryId: string): TicketCategoryState | undefined =>
  event.categories.find((c) => c.id === categoryId);

export const publishEvent = (event: EventState): void => {
  if (event.status !== "draft") throw new Error("Only draft events can be published");
  if (event.categories.filter((c) => c.isActive).length === 0) {
    throw new Error("Event must have at least one active ticket category");
  }
  if (getTotalQuota(event) > event.maxCapacity) throw new Error("Total ticket quota cannot exceed event capacity");
  event.status = "published";
  event.updatedAt = new Date();
  addDomainEvent(event, createEventPublished(event.id));
};

export const cancelEvent = (event: EventState): void => {
  if (event.status === "completed") throw new Error("Completed events cannot be cancelled");
  if (event.status === "cancelled") throw new Error("Event is already cancelled");
  event.status = "cancelled";
  event.updatedAt = new Date();
  addDomainEvent(event, createEventCancelled(event.id));
};

export const addCategory = (
  event: EventState, id: string, name: string, price: Money,
  quota: number, salesStart: Date, salesEnd: Date,
): TicketCategoryState => {
  if (event.status !== "draft" && event.status !== "published") throw new Error("Cannot add category to this event");
  if (salesEnd > event.startDate) throw new Error("Sales period must end before or at the event start date");
  const category = createTicketCategory(id, name, price, quota, salesStart, salesEnd, true);
  if (getTotalQuota(event) + quota > event.maxCapacity) throw new Error("Total ticket quota cannot exceed event capacity");
  event.categories.push(category);
  addDomainEvent(event, createTicketCategoryCreated(event.id, category.id));
  return category;
};

export const disableCategory = (event: EventState, categoryId: string): void => {
  if (event.status === "completed") throw new Error("Cannot disable category on completed event");
  const category = event.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error("Ticket category not found");
  deactivateCategory(category);
  addDomainEvent(event, createTicketCategoryDisabled(event.id, categoryId));
};

export const reserveCategory = (event: EventState, categoryId: string, quantity: number): void => {
  if (event.status !== "published") throw new Error("Event is not published");
  const category = event.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error("Ticket category not found");
  if (!category.isActive) throw new Error("Ticket category is not active");
  if (getSalesStatus(category) !== "active") throw new Error("Ticket category is not available for sale");
  reserveCategoryQuota(category, quantity);
};

export const releaseCategory = (event: EventState, categoryId: string, quantity: number): void => {
  const category = event.categories.find((c) => c.id === categoryId);
  if (!category) throw new Error("Ticket category not found");
  releaseCategoryQuota(category, quantity);
};

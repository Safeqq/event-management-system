import type { Money } from "../value-objects/money";

export type SalesStatus = "active" | "comingSoon" | "salesClosed" | "soldOut";

export interface TicketCategoryState {
  id: string;
  name: string;
  price: Money;
  quota: number;
  salesStart: Date;
  salesEnd: Date;
  isActive: boolean;
  remaining: number;
}

export const createTicketCategory = (
  id: string,
  name: string,
  price: Money,
  quota: number,
  salesStart: Date,
  salesEnd: Date,
  isActive: boolean,
  remaining: number = quota,
): TicketCategoryState => {
  if (price.amount < 0) throw new Error("Ticket price cannot be negative");
  if (quota <= 0) throw new Error("Ticket quota must be greater than zero");
  if (salesEnd < salesStart)
    throw new Error("Sales end must be after sales start");
  return { id, name, price, quota, salesStart, salesEnd, isActive, remaining };
};

export const getSalesStatus = (cat: TicketCategoryState): SalesStatus => {
  const now = new Date();
  if (cat.remaining <= 0) return "soldOut";
  if (now < cat.salesStart) return "comingSoon";
  if (now > cat.salesEnd) return "salesClosed";
  if (!cat.isActive) return "salesClosed";
  return "active";
};

export const deactivateCategory = (cat: TicketCategoryState): void => {
  cat.isActive = false;
};

export const reserveCategoryQuota = (
  cat: TicketCategoryState,
  quantity: number,
): void => {
  if (quantity > cat.remaining) throw new Error("Insufficient remaining quota");
  cat.remaining -= quantity;
};

export const releaseCategoryQuota = (
  cat: TicketCategoryState,
  quantity: number,
): void => {
  cat.remaining += quantity;
};

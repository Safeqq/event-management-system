import type { EventState } from "../aggregates/event";

export interface CalculatedBooking {
  items: {
    ticketCategoryId: string;
    categoryName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
}

export const calculateTotal = (
  categories: { id: string; price: number; name: string }[],
  selected: Map<string, number>,
  serviceFee: number = 0,
): CalculatedBooking => {
  let total = 0;
  const items: {
    ticketCategoryId: string;
    categoryName: string;
    quantity: number;
    unitPrice: number;
  }[] = [];
  for (const cat of categories) {
    const qty = selected.get(cat.id) ?? 0;
    if (qty > 0) {
      items.push({
        ticketCategoryId: cat.id,
        categoryName: cat.name,
        quantity: qty,
        unitPrice: cat.price,
      });
      total += cat.price * qty;
    }
  }
  total += serviceFee;
  return { items, totalAmount: total };
};

export const validateBookingRequest = (
  event: EventState,
  selected: Map<string, number>,
): void => {
  if (event.status !== "published") throw new Error("Event is not published");
  for (const [categoryId, quantity] of selected) {
    if (quantity <= 0)
      throw new Error("Ticket quantity must be greater than zero");
    const category = event.categories.find((c) => c.id === categoryId);
    if (!category) throw new Error("Ticket category not found");
  }
};

import { Event } from "../aggregates/event";
import { Booking } from "../aggregates/booking";

export class BookingDomainService {
  calculateTotal(
    categories: { id: string; price: number; name: string }[],
    selected: Map<string, number>,
    serviceFee: number = 0,
  ): { items: { ticketCategoryId: string; categoryName: string; quantity: number; unitPrice: number }[]; totalAmount: number } {
    let total = 0;
    const items: { ticketCategoryId: string; categoryName: string; quantity: number; unitPrice: number }[] = [];
    for (const cat of categories) {
      const qty = selected.get(cat.id) ?? 0;
      if (qty > 0) {
        items.push({ ticketCategoryId: cat.id, categoryName: cat.name, quantity: qty, unitPrice: cat.price });
        total += cat.price * qty;
      }
    }
    total += serviceFee;
    return { items, totalAmount: total };
  }

  validateBookingRequest(event: Event, selected: Map<string, number>): void {
    if (event.status !== "published") throw new Error("Event is not published");
    for (const [categoryId, quantity] of selected) {
      if (quantity <= 0) throw new Error("Ticket quantity must be greater than zero");
      const category = event.getCategory(categoryId);
      if (!category) throw new Error("Ticket category not found");
    }
  }
}

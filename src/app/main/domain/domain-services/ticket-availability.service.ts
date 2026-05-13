import { Event } from "../aggregates/event";
import { TicketCategory } from "../entities/ticket-category";

export interface AvailabilityResult {
  available: boolean;
  remaining: number;
}

export class TicketAvailabilityService {
  checkAvailability(event: Event, categoryId: string, requestedQuantity: number): AvailabilityResult {
    const category = event.getCategory(categoryId);
    if (!category) return { available: false, remaining: 0 };
    if (!category.isActive) return { available: false, remaining: category.remaining };
    return {
      available: requestedQuantity <= category.remaining,
      remaining: category.remaining,
    };
  }
}

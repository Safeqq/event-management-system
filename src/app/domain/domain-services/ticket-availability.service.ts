import type { EventState } from "../aggregates/event";

export interface AvailabilityResult {
  available: boolean;
  remaining: number;
}

export const checkAvailability = (
  event: EventState,
  categoryId: string,
  requestedQuantity: number,
): AvailabilityResult => {
  const category = event.categories.find((c) => c.id === categoryId);
  if (!category) return { available: false, remaining: 0 };
  if (!category.isActive)
    return { available: false, remaining: category.remaining };
  return {
    available: requestedQuantity <= category.remaining,
    remaining: category.remaining,
  };
};

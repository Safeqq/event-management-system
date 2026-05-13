import { type Aggregate, addDomainEvent } from "./aggregate-root";
import {
  createBookingCreated,
  createBookingPaid,
  createBookingCancelled,
  createBookingExpired,
  createTicketReserved,
} from "../domain-events/events";
import type { DomainEvent } from "../domain-events/domain-event";

export type BookingStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "expired"
  | "refunded";

export interface BookingItem {
  ticketCategoryId: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
}

export interface BookingState extends Aggregate {
  id: string;
  eventId: string;
  customerId: string;
  items: BookingItem[];
  totalAmount: number;
  serviceFee: number;
  status: BookingStatus;
  createdAt: Date;
  paidAt: Date | null;
  paymentDeadline: Date;
  domainEvents: DomainEvent[];
}

export const createBooking = (
  id: string,
  eventId: string,
  customerId: string,
  items: BookingItem[],
  totalAmount: number,
  serviceFee: number,
  status: BookingStatus,
  createdAt: Date,
  paidAt: Date | null,
  paymentDeadline: Date,
  eventIsPublished?: boolean,
): BookingState => {
  if (eventIsPublished === false)
    throw new Error("Booking can only be created for published events");
  if (items.length === 0)
    throw new Error("Booking must have at least one item");
  for (const item of items) {
    if (item.quantity <= 0)
      throw new Error("Ticket quantity must be greater than zero");
  }
  if (paymentDeadline <= createdAt)
    throw new Error("Payment deadline must be after creation time");
  const booking: BookingState = {
    id,
    eventId,
    customerId,
    items,
    totalAmount,
    serviceFee,
    status,
    createdAt,
    paidAt,
    paymentDeadline,
    domainEvents: [],
  };
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  addDomainEvent(
    booking,
    createBookingCreated(id, eventId, customerId, totalAmount),
  );
  addDomainEvent(booking, createTicketReserved(id, eventId, totalQuantity));
  return booking;
};

export const getSubtotal = (booking: BookingState): number =>
  booking.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

export const payBooking = (booking: BookingState, amount: number): void => {
  if (booking.status !== "pending")
    throw new Error("Only pending bookings can be paid");
  if (new Date() > booking.paymentDeadline)
    throw new Error("Payment deadline has passed");
  if (amount < booking.totalAmount)
    throw new Error("Payment amount must equal total booking price");
  booking.status = "paid";
  booking.paidAt = new Date();
  addDomainEvent(booking, createBookingPaid(booking.id, booking.totalAmount));
};

export const cancelBooking = (booking: BookingState): void => {
  if (booking.status === "cancelled" || booking.status === "refunded")
    throw new Error("Booking is already finalised");
  booking.status = "cancelled";
  addDomainEvent(booking, createBookingCancelled(booking.id));
};

export const expireBooking = (booking: BookingState): void => {
  if (booking.status !== "pending")
    throw new Error("Only pending bookings can expire");
  booking.status = "expired";
  addDomainEvent(booking, createBookingExpired(booking.id));
};

export const markBookingRefunded = (booking: BookingState): void => {
  if (booking.status !== "paid")
    throw new Error("Only paid bookings can be refunded");
  booking.status = "refunded";
};

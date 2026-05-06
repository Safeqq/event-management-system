// Database Schema - Definisi tabel PostgreSQL menggunakan Drizzle ORM
//
// Tables:
// - events: data event (id, name, description, venue, startAt, endAt, maxCapacity, status, createdAt)
// - ticketCategories: kategori tiket per event (id, eventId, name, price, currency, quota, bookedQuantity, salesStart, salesEnd, isActive)
// - bookings: data booking (id, eventId, customerName, customerEmail, totalAmount, currency, status, paymentDeadline, createdAt, paidAt)
// - bookingItems: item booking (id, bookingId, ticketCategoryId, quantity, unitPrice, currency)
// - tickets: data tiket (id, bookingId, eventId, ticketCategoryId, ticketCode, customerName, status, issuedAt, checkedInAt)
// - refunds: data refund (id, bookingId, amount, currency, status, requestedAt, approvedAt, rejectedAt, paidOutAt, rejectionReason, paymentReference)
//
// Foreign Keys:
// - ticketCategories.eventId -> events.id
// - bookings.eventId -> events.id
// - bookingItems.bookingId -> bookings.id
// - bookingItems.ticketCategoryId -> ticketCategories.id
// - tickets.bookingId -> bookings.id
// - tickets.eventId -> events.id
// - tickets.ticketCategoryId -> ticketCategories.id
// - refunds.bookingId -> bookings.id

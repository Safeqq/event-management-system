// Domain Events - Semua domain events yang terjadi di sistem
//
// Event-related:
// - EventCreated: event baru dibuat
// - EventPublished: event dipublikasi
// - EventCancelled: event dibatalkan
// - TicketCategoryCreated: kategori tiket ditambahkan
// - TicketCategoryDisabled: kategori tiket dinonaktifkan
//
// Booking-related:
// - TicketReserved: tiket di-reserve saat booking dibuat
// - BookingPaid: booking dibayar
// - BookingExpired: booking kadaluarsa
//
// Ticket-related:
// - TicketCheckedIn: tiket di-check-in
//
// Refund-related:
// - RefundRequested: customer request refund
// - RefundApproved: admin approve refund
// - RefundRejected: admin reject refund
// - RefundPaidOut: refund sudah dibayarkan

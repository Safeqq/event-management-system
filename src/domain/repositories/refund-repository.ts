// Interface IRefundRepository - Contract untuk persistence layer Refund entity
//
// Methods:
// - save(refund: Refund): Promise<void> - save/update refund
// - findById(id: string): Promise<Refund | null> - get refund by ID
// - findByBookingId(bookingId: string): Promise<Refund[]> - get semua refunds dari booking
//
// Implementation ada di infrastructure layer:
// - PostgresRefundRepository (untuk production)

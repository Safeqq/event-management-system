// PostgresRefundRepository - Implementasi IRefundRepository untuk PostgreSQL
// Menggunakan Drizzle ORM untuk query database
//
// Table:
// - refunds: data refund
//
// Methods:
// - save(refund): upsert refund (insert atau update jika sudah ada)
// - findById(id): query refund by ID
// - findByBookingId(bookingId): query semua refunds dari booking

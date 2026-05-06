// PostgresTicketRepository - Implementasi ITicketRepository untuk PostgreSQL
// Menggunakan Drizzle ORM untuk query database
//
// Table:
// - tickets: data tiket
//
// Methods:
// - save(ticket): upsert ticket (insert atau update jika sudah ada)
// - findById(id): query ticket by ID
// - findByCode(code): query ticket by ticket code (untuk check-in)
// - findByBookingId(bookingId): query semua tickets dari booking
// - findByEventId(eventId): query semua tickets untuk event (untuk participants list)

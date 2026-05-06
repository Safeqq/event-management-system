// PostgresBookingRepository - Implementasi BookingRepository untuk PostgreSQL
// Menggunakan Drizzle ORM untuk query database
//
// Tables:
// - bookings: data booking utama
// - bookingItems: item booking (kategori tiket + quantity) per booking (one-to-many)
//
// Methods:
// - save(booking): upsert booking dan booking items dalam transaction
//   - Insert/update booking
//   - Delete existing items
//   - Insert new items
// - findById(id): query booking dengan join booking items
// - findByEventId(eventId): query semua bookings untuk event tertentu
// - findByEventAndCustomer(eventId, customerEmail): query bookings customer untuk event tertentu
//
// Note: Menggunakan transaction untuk menjaga data consistency

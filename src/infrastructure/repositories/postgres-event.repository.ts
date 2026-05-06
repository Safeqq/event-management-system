// PostgresEventRepository - Implementasi EventRepository untuk PostgreSQL
// Menggunakan Drizzle ORM untuk query database
//
// Tables:
// - events: data event utama
// - ticketCategories: kategori tiket per event (one-to-many)
//
// Methods:
// - save(event): upsert event dan ticket categories dalam transaction
//   - Insert/update event
//   - Delete existing categories
//   - Insert new categories
// - findById(id): query event dengan join ticket categories
// - findAll(): query semua events dengan join ticket categories
//
// Note: Menggunakan transaction untuk menjaga data consistency

// Database Connection - Setup koneksi ke PostgreSQL menggunakan Drizzle ORM
//
// Configuration:
// - Connection string dari environment variable DATABASE_URL
// - Default: postgresql://postgres:postgres@localhost:5432/event_ticketing
//
// Export:
// - db: Drizzle database instance dengan schema
//
// Digunakan oleh semua repository implementations untuk query database

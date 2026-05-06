// Database Seed Script - Populate database dengan data testing yang comprehensive
//
// Tujuan:
// - Seed data untuk testing semua endpoints dan scenarios
// - Deterministic IDs untuk testing yang predictable
// - Cover semua status (Draft, Published, Cancelled, Completed, dll)
//
// Data yang di-seed:
// - 5 events dengan berbagai status
// - Multiple ticket categories per event
// - Bookings dengan berbagai status (Pending, Paid, Expired, Refunded)
// - Tickets dengan berbagai status (Active, CheckedIn, Cancelled)
// - Refunds dengan berbagai status (Requested, Approved, Rejected, PaidOut)
//
// Usage:
// - bun run src/infrastructure/seed.ts
//
// Note: Script akan clean existing data sebelum seed

// Unit Tests - Domain Layer
// Test semua business rules di domain entities dan value objects
//
// Test coverage:
// - Event Entity: validation rules, publish, cancel, add ticket category
// - Booking Entity: validation, payment, expiry, refund
// - Ticket Entity: check-in rules, duplicate check-in prevention
// - Refund Entity: approve, reject, payout rules
// - Value Objects: Money, Email, DateRange, TicketCode validation
//
// Tujuan:
// - Memastikan semua business rules di domain layer berjalan dengan benar
// - Test tanpa dependencies (pure unit tests)
// - Fast execution

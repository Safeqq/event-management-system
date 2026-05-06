// Booking Routes - Alternative routing setup menggunakan use cases
// (Tidak digunakan di create-app.ts yang sekarang, tapi bisa digunakan sebagai alternatif)
//
// Dependencies:
// - Use cases: CreateBooking, GetBooking, ConfirmBooking, CancelBooking
//
// Endpoints:
// - POST /bookings - Create booking
// - GET /bookings/:id - Get booking
// - POST /bookings/:id/confirm - Confirm booking (pay)
// - POST /bookings/:id/cancel - Cancel booking
//
// Note: Ini adalah alternative approach dengan use case pattern

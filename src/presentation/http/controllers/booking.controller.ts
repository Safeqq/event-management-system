// Booking Controller - HTTP endpoints untuk booking management
//
// Dependencies:
// - EventRepository, BookingRepository, TicketRepository
// - PaymentGateway service
// - Command handlers: CreateBooking, PayBooking, ExpireBooking
// - Query handlers: GetBooking, GetTicketsByBooking
//
// Endpoints:
// - POST /api/v1/bookings - Create booking (US8)
// - GET /api/v1/bookings/:id - Get booking details (US9)
// - POST /api/v1/bookings/:id/pay - Pay booking (US10)
// - POST /api/v1/bookings/:id/expire - Expire booking (US11, untuk testing/admin)
// - GET /api/v1/bookings/:id/tickets - View purchased tickets (US12)
//
// Note: Expire booking seharusnya dijalankan oleh background job/scheduler

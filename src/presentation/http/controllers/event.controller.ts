// Event Controller - HTTP endpoints untuk event management
//
// Dependencies:
// - EventRepository, BookingRepository, TicketRepository
// - Command handlers: CreateEvent, PublishEvent, CancelEvent, AddTicketCategory, DisableTicketCategory
// - Query handlers: GetEvent, ListEvents, GetSalesReport, GetParticipants
//
// Endpoints:
// - POST /api/v1/events - Create event (US1)
// - GET /api/v1/events - List events dengan filter (US6)
// - GET /api/v1/events/:id - Get event detail (US7)
// - POST /api/v1/events/:id/publish - Publish event (US2)
// - POST /api/v1/events/:id/cancel - Cancel event (US3)
// - POST /api/v1/events/:id/ticket-categories - Add ticket category (US4)
// - POST /api/v1/events/:id/ticket-categories/:categoryId/disable - Disable ticket category (US5)
// - GET /api/v1/events/:id/sales-report - Get sales report (US19)
// - GET /api/v1/events/:id/participants - Get participants list (US20)
//
// Note: US = User Story number dari requirements

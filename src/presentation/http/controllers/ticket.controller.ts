// Ticket Controller - HTTP endpoints untuk ticket operations
//
// Dependencies:
// - TicketRepository, EventRepository
// - Command handler: CheckInTicket
//
// Endpoints:
// - POST /api/v1/tickets/check-in - Check in ticket (US13 & US14)
//   - Input: ticketCode, eventId
//   - Validasi: ticket valid, belum check-in, event match
//   - Gate Officer only

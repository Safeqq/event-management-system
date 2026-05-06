// Interface ITicketRepository - Contract untuk persistence layer Ticket entity
//
// Methods:
// - save(ticket: Ticket): Promise<void> - save/update ticket
// - findById(id: string): Promise<Ticket | null> - get ticket by ID
// - findByCode(code: string): Promise<Ticket | null> - get ticket by ticket code (untuk check-in)
// - findByBookingId(bookingId: string): Promise<Ticket[]> - get semua tickets dari booking
// - findByEventId(eventId: string): Promise<Ticket[]> - get semua tickets untuk event (untuk participants list)
//
// Implementation ada di infrastructure layer:
// - PostgresTicketRepository (untuk production)

// Interface BookingRepository - Contract untuk persistence layer Booking aggregate
//
// Methods:
// - findById(id: string): Promise<Booking | null> - get booking by ID
// - findByEventId(eventId: string): Promise<Booking[]> - get semua bookings untuk event tertentu
// - findByEventAndCustomer(eventId: string, customerEmail: string): Promise<Booking[]> - get bookings customer untuk event tertentu
// - save(booking: Booking): Promise<void> - save/update booking
//
// Implementation ada di infrastructure layer:
// - InMemoryBookingRepository (untuk testing)
// - PostgresBookingRepository (untuk production)

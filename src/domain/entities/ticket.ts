// Entity Ticket - Tiket individual yang dimiliki customer
// Setiap tiket punya unique ticket code untuk check-in
//
// Properties:
// - id, bookingId, eventId, ticketCategoryId
// - ticketCode: unique code untuk check-in
// - customerName
// - status: Active, CheckedIn, Cancelled, RefundRequired
// - issuedAt: waktu tiket diterbitkan
// - checkedInAt: waktu check-in (jika sudah check-in)
//
// Business rules:
// - Tiket harus match dengan event saat check-in
// - Tiket yang sudah checked-in tidak bisa check-in lagi
// - Tiket cancelled tidak bisa check-in
// - Check-in hanya bisa dilakukan pada hari event atau setelahnya
// - Tiket yang sudah checked-in tidak bisa dibatalkan
//
// Domain events:
// - TicketCheckedIn: saat tiket di-check-in

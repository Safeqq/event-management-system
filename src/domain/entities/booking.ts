// Entity Booking - Aggregate root untuk proses pemesanan tiket
// Merepresentasikan satu transaksi pembelian tiket oleh customer
// 
// Properties:
// - id, eventId, customerName, customerEmail
// - items: array item booking (kategori tiket + quantity)
// - totalAmount: total harga yang harus dibayar
// - status: PendingPayment, Paid, Expired, Refunded
// - paymentDeadline: batas waktu pembayaran (15 menit dari create)
// - createdAt, paidAt
//
// Business rules:
// - Booking harus punya minimal 1 item
// - Quantity harus positive integer
// - Payment amount harus sama dengan total amount
// - Hanya booking pending yang bisa dibayar
// - Tidak bisa bayar setelah deadline
// - Hanya booking paid yang bisa di-refund
//
// Domain events:
// - TicketReserved: saat booking dibuat
// - BookingPaid: saat pembayaran berhasil
// - BookingExpired: saat booking kadaluarsa

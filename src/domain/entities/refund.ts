// Entity Refund - Permintaan pengembalian dana dari customer
// Merepresentasikan proses refund untuk booking yang sudah dibayar
//
// Properties:
// - id, bookingId
// - amount: jumlah yang akan di-refund
// - status: Requested, Approved, Rejected, PaidOut
// - requestedAt: waktu customer request refund
// - approvedAt, rejectedAt, paidOutAt
// - rejectionReason: alasan jika ditolak
// - paymentReference: referensi pembayaran refund
//
// Business rules:
// - Hanya refund dengan status Requested yang bisa di-approve/reject
// - Rejection harus punya alasan
// - Hanya refund Approved yang bisa di-payout
// - Payout harus punya payment reference
//
// Domain events:
// - RefundRequested: saat customer request refund
// - RefundApproved: saat admin approve
// - RefundRejected: saat admin reject
// - RefundPaidOut: saat refund sudah dibayarkan

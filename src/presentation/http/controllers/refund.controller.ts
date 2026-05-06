// Refund Controller - HTTP endpoints untuk refund management
//
// Dependencies:
// - BookingRepository, TicketRepository, RefundRepository
// - RefundPaymentService
// - Command handlers: RequestRefund, ApproveRefund, RejectRefund, PayoutRefund
//
// Endpoints:
// - POST /api/v1/refunds - Request refund (US15)
//   - Input: bookingId
//   - Customer only
//
// - POST /api/v1/refunds/:id/approve - Approve refund (US16)
//   - Event Organizer only
//
// - POST /api/v1/refunds/:id/reject - Reject refund (US17)
//   - Input: reason
//   - Event Organizer only
//
// - POST /api/v1/refunds/:id/payout - Mark refund as paid out (US18)
//   - System Admin only

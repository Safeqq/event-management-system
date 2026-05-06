// Mock Payment Gateway Service - Simulasi payment gateway untuk development/testing
//
// Implements: IPaymentGateway interface
//
// Method:
// - processPayment(params): simulate payment processing
//   - Input: bookingId, amount
//   - Output: payment reference (mock)
//   - Real implementation akan call external API (Midtrans, Xendit, Stripe, dll)
//
// Note: Untuk production, ganti dengan real payment gateway implementation

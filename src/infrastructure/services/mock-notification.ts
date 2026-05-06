// Mock Notification Service - Simulasi notification service untuk development/testing
//
// Implements: INotificationService interface
//
// Methods:
// - sendEmail(params): simulate email sending
//   - Input: to, subject, body
//   - Real implementation akan call email service API (SendGrid, AWS SES, dll)
//
// - sendWhatsApp(params): simulate WhatsApp sending
//   - Input: to, message
//   - Real implementation akan call WhatsApp Business API
//
// Note: Untuk production, ganti dengan real notification service implementation

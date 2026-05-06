// Application Factory - Setup Elysia app dengan semua dependencies
//
// Setup:
// - Initialize repositories (Postgres implementations)
// - Initialize services (Payment gateway, Notification, Refund payment)
// - Setup Swagger documentation
// - Setup error handling (DomainError, ValidationError, dll)
// - Register controllers (Event, Booking, Ticket, Refund)
//
// Error Handling:
// - DomainError -> return error response dengan status code dari error
// - ValidationError -> 422 Unprocessable Entity
// - NotFoundError -> 404 Not Found
// - ParseError -> 400 Bad Request
// - Internal Error -> 500 Internal Server Error
//
// Health Check:
// - GET /health -> return service status
//
// Export:
// - createApp(): Promise<Elysia> - factory function untuk create app instance

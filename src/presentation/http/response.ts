// Response Helpers - Standard response format untuk API
//
// Types:
// - ApiResponse<T>: standard response structure
//   - success: boolean
//   - message: string
//   - data?: T
//   - error?: ErrorDetail
//
// - ErrorDetail: error information
//   - code: error code
//   - message: error message
//   - field?: field name (untuk validation error)
//   - details?: additional details
//
// Helper Functions:
// - success<T>(data, message): create success response
// - error(message, code, field, details): create error response

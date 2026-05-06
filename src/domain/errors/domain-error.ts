// Domain Error Classes - Custom error untuk business rule violations
//
// DomainError (base class):
// - message: pesan error
// - statusCode: HTTP status code (default: 400)
// - code: error code untuk client
//
// NotFoundError (404):
// - Untuk resource yang tidak ditemukan
//
// ValidationError (400):
// - Untuk validasi input yang gagal
// - field: nama field yang error (optional)
//
// ConflictError (409):
// - Untuk konflik state (misal: tiket sudah habis)
//
// UnauthorizedError (401):
// - Untuk akses yang tidak terautentikasi
//
// ForbiddenError (403):
// - Untuk akses yang tidak diizinkan

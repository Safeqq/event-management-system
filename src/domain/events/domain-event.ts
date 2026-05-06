// Interface DomainEvent - Base interface untuk semua domain events
//
// Properties:
// - occurredAt: Date - waktu event terjadi
// - eventType: string - tipe event (nama event)
//
// Domain events digunakan untuk:
// - Komunikasi antar aggregates
// - Audit trail
// - Trigger side effects (kirim email, update cache, dll)
// - Event sourcing (optional)

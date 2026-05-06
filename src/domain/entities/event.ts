// Entity Event - Aggregate root untuk event/acara
// Merepresentasikan satu event yang bisa dijual tiketnya
//
// Properties:
// - id, name, description, venue
// - startAt, endAt: waktu event berlangsung
// - maxCapacity: kapasitas maksimal event
// - status: Draft, Published, Cancelled, Completed
// - ticketCategories: array kategori tiket yang tersedia
// - createdAt
//
// Business rules:
// - Event end time harus setelah start time
// - Capacity harus > 0
// - Hanya draft event yang bisa dipublish
// - Harus punya minimal 1 active ticket category untuk publish
// - Total quota ticket categories tidak boleh melebihi max capacity
// - Hanya published event yang bisa dibatalkan
// - Completed event tidak bisa dibatalkan
// - Hanya published event yang bisa reserve tickets
//
// Domain events:
// - EventCreated: saat event dibuat
// - EventPublished: saat event dipublish
// - EventCancelled: saat event dibatalkan

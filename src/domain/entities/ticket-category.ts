// Entity TicketCategory - Kategori tiket dalam sebuah event
// Contoh: VIP, Regular, Early Bird, dll
//
// Properties:
// - id, eventId, name
// - price: harga tiket kategori ini
// - quota: jumlah tiket yang tersedia
// - bookedQuantity: jumlah yang sudah dibooking
// - salesPeriod: periode penjualan (start & end date)
// - isActive: apakah kategori masih aktif
//
// Computed:
// - availableQuantity: quota - bookedQuantity
//
// Business rules:
// - Price tidak boleh negatif
// - Quota harus > 0
// - bookedQuantity tidak boleh > quota
// - Kategori bisa dibeli jika: active, dalam sales period, dan ada available quantity
// - Reserve hanya bisa dilakukan jika kategori active dan ada available quantity
// - Quantity harus positive integer
//
// Domain events:
// - TicketCategoryCreated: saat kategori dibuat
// - TicketCategoryDisabled: saat kategori dinonaktifkan

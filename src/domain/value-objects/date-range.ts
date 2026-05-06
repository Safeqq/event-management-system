// Value Object DateRange - Merepresentasikan rentang waktu (start - end)
//
// Properties:
// - start: Date - tanggal mulai
// - end: Date - tanggal selesai
//
// Business rules:
// - End date tidak boleh lebih awal dari start date
//
// Methods:
// - contains(date: Date): boolean - cek apakah date ada dalam range
// - isActive(now: Date): boolean - cek apakah range sedang aktif (now berada di antara start dan end)

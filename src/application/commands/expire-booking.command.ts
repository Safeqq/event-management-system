// Command untuk mengexpire booking yang belum dibayar melewati batas waktu
// Input: booking ID
// Validasi: booking masih pending, sudah melewati expiry time
// Side effect: release reserved tickets, update status booking menjadi expired

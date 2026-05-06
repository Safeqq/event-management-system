// InMemoryBookingRepository - Implementasi BookingRepository untuk testing
// Menyimpan bookings di memory menggunakan Map
//
// Digunakan untuk:
// - Unit testing
// - Integration testing tanpa database
// - Development cepat tanpa setup database
//
// Methods:
// - findById(id): get booking by ID dari Map
// - save(booking): simpan booking ke Map (serialize ke JSON dulu)
//
// Note: Data hilang saat aplikasi restart

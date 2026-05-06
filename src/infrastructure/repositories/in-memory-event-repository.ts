// InMemoryEventRepository - Implementasi EventRepository untuk testing
// Menyimpan events di memory menggunakan Map
//
// Digunakan untuk:
// - Unit testing
// - Integration testing tanpa database
// - Development cepat tanpa setup database
//
// Methods:
// - findAll(): get semua events dari Map
// - findById(id): get event by ID dari Map
// - save(event): simpan event ke Map (serialize ke JSON dulu)
//
// Note: Data hilang saat aplikasi restart

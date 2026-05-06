// Interface EventRepository - Contract untuk persistence layer Event aggregate
//
// Methods:
// - findAll(): Promise<Event[]> - get semua events
// - findById(id: string): Promise<Event | null> - get event by ID
// - save(event: Event): Promise<void> - save/update event
//
// Implementation ada di infrastructure layer:
// - InMemoryEventRepository (untuk testing)
// - PostgresEventRepository (untuk production)

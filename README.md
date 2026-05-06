# ElysiaJS Clean Architecture: Event Ticketing & Booking

Backend API untuk **Event Ticketing & Booking System** menggunakan **Bun + ElysiaJS + TypeScript + Drizzle ORM + PostgreSQL** dengan pola **Clean Architecture** dan **Domain-Driven Design**.

## Struktur Project

```
src/
├── domain/           # Entity, Value Object, Repository Interface, Domain Event, Error
├── application/      # Command, Query, Handler, DTO, Service Interface
├── infrastructure/   # PostgreSQL Repository, DB Connection, Seed, Mock Service
├── presentation/     # HTTP Controller, Route, Response Helper
└── shared/           # Utility (ID generator)
```

## Manual Setup (Tanpa Docker)

### Prasyarat
- [Bun](https://bun.sh/) v1.3+
- PostgreSQL 16+

### Langkah-langkah

```bash
# 1. Install dependencies
bun install

# 2. Setup environment
cp .env.example .env
# Edit .env sesuai konfigurasi PostgreSQL kamu

# 3. Push schema ke database
bun run db:push

# 4. Seed database
bun run db:seed

# 5. Jalankan server
bun run dev
```

Server berjalan di `http://localhost:3000`.
Swagger UI di `http://localhost:3000/swagger`.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [ElysiaJS](https://elysiajs.com/)
- **Language**: TypeScript
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: PostgreSQL 16
- **Architecture**: Clean Architecture + DDD Tactical Patterns

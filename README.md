# Event Ticketing & Booking System — Clean Architecture & DDD

Proyek ini dikembangkan untuk **EF2344-02 Konstruksi Perangkat Lunak** — **Departemen Teknik Informatika, ITS**.

**Topik:** Case Study – Event Ticketing & Booking System  
**Arsitektur:** Clean Architecture + Domain-Driven Design Tactical Patterns  
**Stack:** Bun + ElysiaJS + TypeScript

---

## Progress Week 9-10: Domain Layer & Unit Tests

### 1. Aggregates — `domain/aggregates/`

| File | Status Lifecycle | Domain Events |
|---|---|---|
| `aggregate-root.ts` | Base class | — |
| `event.ts` | Draft → Published → Cancelled / Completed | `EventCreated`, `EventPublished`, `EventCancelled` |
| `booking.ts` | Pending → Paid / Cancelled / Expired / Refunded | `BookingCreated`, `BookingPaid`, `BookingCancelled`, `BookingExpired` |
| `ticket.ts` | Active → CheckedIn / Refunded / Cancelled | — |
| `refund.ts` | Requested → Approved / Rejected → PaidOut | — |
| `user.ts` | Organizer / Customer / Admin | — |
| `promo-code.ts` | Percentage / Fixed discount | — |

### 2. Entities — `domain/entities/`

| File | Deskripsi |
|---|---|
| `entity.ts` | Base class dengan `equals()` berdasarkan ID |
| `ticket-category.ts` | Child entity dari Event (status: active, comingSoon, salesClosed, soldOut) |

### 3. Value Objects — `domain/value-objects/`

| File | Invariant |
|---|---|
| `email.ts` | Validasi format email |
| `money.ts` | Amount >= 0, currency default IDR |
| `date-range.ts` | End >= Start |
| `ticket-code.ts` | Min 8 karakter, generate via nanoid |

### 4. Domain Services — `domain/domain-services/`

| File | Business Logic |
|---|---|
| `booking.service.ts` | Hitung total harga + validasi booking request |
| `ticket-availability.service.ts` | Cek ketersediaan tiket per kategori |

### 5. Domain Events — `domain/domain-events/`

**15 domain events:**

| Event | Trigger |
|---|---|
| `EventCreated` | Event dibuat |
| `EventPublished` | Event dipublikasi |
| `EventCancelled` | Event dibatalkan |
| `TicketCategoryCreated` | Kategori tiket ditambahkan |
| `TicketCategoryDisabled` | Kategori tiket dinonaktifkan |
| `BookingCreated` | Booking dibuat |
| `BookingPaid` | Booking dibayar |
| `BookingCancelled` | Booking dibatalkan |
| `BookingExpired` | Booking kadaluarsa |
| `TicketReserved` | Tiket direservasi |
| `TicketCheckedIn` | Tiket di-check-in |
| `RefundRequested` | Refund diminta |
| `RefundApproved` | Refund disetujui |
| `RefundRejected` | Refund ditolak |
| `RefundPaidOut` | Refund dibayarkan |

### 6. Repository Interfaces — `domain/repository-interfaces/`

| Interface | Methods |
|---|---|
| `EventRepository` | findById, findAll, findByOrganizer, save, update, delete |
| `BookingRepository` | findById, findByCustomer, findByEvent, save, update |
| `TicketRepository` | findById, findByBooking, findByEvent, findByCustomer, findByCode, save, update |
| `UserRepository` | findById, findByEmail, save, update |
| `RefundRepository` | findById, findByBooking, save, update |
| `PromoCodeRepository` | findById, findByCode, findAllActive, save, update |

### 7. Domain Unit Tests — `domain/tests/`

**70 tests — 0 fail**

| File | Tests | Coverage |
|---|---|---|
| `user-stories.test.ts` | 64 | 12 minimum test cases + user stories + edge cases |
| `entities.test.ts` | 2 | User entity equality |
| `value-objects.test.ts` | 4 | Email, Money, DateRange, TicketCode |

**12 Minimum Test Cases (AGENT.md §5):**

| # | Test Case | Status |
|---|---|---|
| 1 | Event tidak bisa dibuat jika end date < start date | ✅ |
| 2 | Event tidak bisa dibuat dengan kapasitas ≤ 0 | ✅ |
| 3 | Event tidak bisa dipublish tanpa kategori tiket aktif | ✅ |
| 4 | Kuota kategori tiket tidak boleh melebihi kapasitas event | ✅ |
| 5 | Booking tidak bisa dibuat dengan quantity 0 | ✅ |
| 6 | Booking tidak bisa dibayar setelah payment deadline | ✅ |
| 7 | Booking tidak bisa dibayar dengan jumlah tidak sesuai | ✅ |
| 8 | Booking paid tidak bisa expire | ✅ |
| 9 | Tiket yang sudah check-in tidak bisa di-check-in lagi | ✅ |
| 10 | Refund tidak bisa diminta jika tiket sudah check-in | ✅ |
| 11 | Refund tidak bisa disetujui jika status bukan Requested | ✅ |
| 12 | Refund ditolak harus menyertakan alasan | ✅ |

```bash
# Semua test
bun test src/app/main/domain/tests/

# Atau via alias
bun run test:domain

# File spesifik
bun test src/app/main/domain/tests/user-stories.test.ts
```

---

## Ubiquitous Language Glossary

| Istilah | Arti |
|---|---|
| **Event** | Kegiatan yang diorganisir oleh Event Organizer |
| **Event Organizer** | User yang membuat dan mengelola event |
| **Customer** | User yang booking dan membeli tiket |
| **Gate Officer** | User yang memvalidasi tiket saat check-in |
| **Ticket Category** | Jenis tiket (Regular, VIP, Early Bird) |
| **Quota** | Jumlah maksimal tiket per kategori |
| **Booking** | Reservasi sementara sebelum pembayaran |
| **PendingPayment** | Booking yang belum dibayar |
| **Paid** | Booking yang sudah dibayar |
| **Expired** | Booking yang melewati deadline pembayaran |
| **Ticket** | Bukti kehadiran setelah booking dibayar |
| **Ticket Code** | Kode unik untuk validasi tiket |
| **Check-in** | Validasi tiket saat masuk venue |
| **Refund** | Pengembalian uang ke customer |
| **Money** | Value object: jumlah + mata uang |
| **Sales Period** | Periode penjualan tiket per kategori |
| **Payment Deadline** | Batas waktu bayar (15 menit setelah booking) |

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [ElysiaJS](https://elysiajs.com/)
- **Language:** TypeScript
- **Architecture:** Clean Architecture + DDD Tactical Patterns

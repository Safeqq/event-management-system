# Event Management System — DDD Structure

Backend API untuk **Event Ticketing & Booking System** menggunakan **Bun + ElysiaJS + TypeScript** dengan pola **Domain-Driven Design**.

## DDD Tactical Patterns — 7 Komponen Utama

### 1. Aggregates — `domain/aggregates/`
| File | Deskripsi |
|---|---|
| `aggregate-root.ts` | Abstract base class dengan domain event tracking |
| `event.ts` | Event aggregate (status: draft, published, cancelled) |
| `booking.ts` | Booking aggregate (status: pending, paid, cancelled, expired, refunded) |

### 2. Entities — `domain/entities/`
| File | Deskripsi |
|---|---|
| `entity.ts` | Abstract base class dengan `equals()` berdasarkan ID |
| `user.ts` | User entity (role: organizer, customer, admin) |
| `ticket.ts` | Ticket entity (status: active, used, refunded, cancelled) |
| `refund.ts` | Refund entity (status: requested, approved, rejected, paid_out) |
| `promo-code.ts` | PromoCode entity (discount: percentage/fixed) |

### 3. Value Objects — `domain/value-objects/`
| File | Deskripsi |
|---|---|
| `email.ts` | Validated email value object |
| `money.ts` | Monetary value with currency (default IDR) |
| `date-range.ts` | Date range with `contains()` & `isActive()` |
| `ticket-code.ts` | Auto-generated unique ticket code (nanoid) |

### 4. Domain Services — `api/*/service/`
| File | Deskripsi |
|---|---|
| `api/event/service/event.service.ts` | Event service (create, publish, cancel) |
| `api/booking/service/booking.service.ts` | Booking service (create, pay, cancel, expire) |
| `api/ticket/service/ticket.service.ts` | Ticket service (check-in, get by customer) |
| `api/refund/service/refund.service.ts` | Refund service (request, approve, reject, payout) |
| `api/auth/service/auth.service.ts` | Auth service (register, login) |
| `api/promo-code/service/promo-code.service.ts` | PromoCode service (validate, deactivate) |
| `api/dashboard/service/dashboard.service.ts` | Dashboard service (stats) |
| `api/customer/service/customer.service.ts` | Customer service (bookings, tickets) |

### 5. Domain Events — `domain/domain-events/`
| File | Deskripsi |
|---|---|
| `domain-event.ts` | Base interface (`occurredAt`, `eventType`) |
| `events.ts` | Event classes: EventCreated, BookingPaid, TicketReserved, dll. |

### 6. Repository Interfaces — `api/*/repository/`
| File | Deskripsi |
|---|---|
| `api/event/repository/event-repository.ts` | Event repository interface |
| `api/booking/repository/booking-repository.ts` | Booking repository interface |
| `api/ticket/repository/ticket-repository.ts` | Ticket repository interface |
| `api/refund/repository/refund-repository.ts` | Refund repository interface |
| `api/auth/repository/user-repository.ts` | User repository interface |
| `api/promo-code/repository/promo-code-repository.ts` | PromoCode repository interface |

### 7. Domain Unit Tests — `domain/tests/`
| File | User Story |
|---|---|
| `value-objects.test.ts` | Email, Money, DateRange, TicketCode — validasi value object |
| `entities.test.ts` | User entity — creation & equality |
| `user-stories.test.ts` | 26 test — create & publish event, booking & payment, check-in tiket, refund flow, promo code, registrasi user |

```bash
bun test src/app/main/domain/tests/
```

```
26 pass
 0 fail
34 expect() calls
```

## Running Tests

```bash
# Semua domain tests
bun test src/app/main/domain/tests/

# Specific test file
bun test src/app/main/domain/tests/user-stories.test.ts
bun test src/app/main/domain/tests/value-objects.test.ts
bun test src/app/main/domain/tests/entities.test.ts
```

## User Stories

### Event Organizer
| Sebagai… | Saya ingin… | Sehingga… | Terkait |
|---|---|---|---|
| Organizer | membuat event dengan kategori tiket | peserta bisa memilih tiket yang sesuai | `Event` aggregate, `EventService` |
| Organizer | mempublikasikan event | event bisa mulai dijual | `Event` aggregate, `EventService` |
| Organizer | membatalkan event | peserta tidak bisa booking lagi | `Event` aggregate, `EventService` |
| Organizer | melihat laporan penjualan | tahu jumlah tiket terjual & revenue | `DashboardService` |
| Organizer | menyetujui/menolak refund | mengelola permintaan refund peserta | `RefundService` |

### Customer / Peserta
| Sebagai… | Saya ingin… | Sehingga… | Terkait |
|---|---|---|---|
| Customer | mendaftar akun | bisa melakukan booking | `User` entity, `AuthService` |
| Customer | melihat daftar event | memilih event yang ingin dihadiri | `EventRepository` |
| Customer | booking tiket | mendapatkan tiket masuk event | `Booking` aggregate, `BookingService` |
| Customer | membayar booking | tiket saya aktif | `BookingService` |
| Customer | request refund | mendapatkan uang kembali | `Refund` entity, `RefundService` |
| Customer | melihat tiket saya | tahu tiket yang sudah dibeli | `TicketService` |

### Gate Officer
| Sebagai… | Saya ingin… | Sehingga… | Terkait |
|---|---|---|---|
| Gate Officer | check-in tiket | memverifikasi peserta masuk | `Ticket` entity, `TicketService` |

### Admin
| Sebagai… | Saya ingin… | Sehingga… | Terkait |
|---|---|---|---|
| Admin | payout refund | peserta menerima uang kembali | `RefundService` |

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [ElysiaJS](https://elysiajs.com/)
- **Language**: TypeScript
- **Architecture**: DDD Tactical Patterns

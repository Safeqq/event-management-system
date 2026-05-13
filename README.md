# Event Ticketing & Booking System -- Clean Architecture & DDD

Proyek ini dikembangkan untuk **EF2344-02 Konstruksi Perangkat Lunak** -- **Departemen Teknik Informatika, ITS**.

**Topik:** Case Study -- Event Ticketing & Booking System  
**Arsitektur:** Clean Architecture + Domain-Driven Design Tactical Patterns  
**Paradigma:** Functional Programming (ES8 arrow functions, factory functions, no classes)  
**Stack:** Bun + ElysiaJS + TypeScript

---

## Progress Week 8: Project Structure

- Clean Architecture folder structure (`domain/`, `api/`, `database/`, `infrastructure/`, `middlewares/`, `entities/`)
- Initial business rules derived from acceptance criteria
- Ubiquitous Language Glossary (`docs/ubiquitous-language-glossary.md`)
- ElysiaJS app setup with Swagger docs + health check endpoint

---

## Progress Week 9-10: Domain Layer & Unit Tests

### 1. Aggregates -- `domain/aggregates/`

| File | State Lifecycle | Domain Events Raised |
|---|---|---|
| `event.ts` | Draft -> Published -> Cancelled / Completed | `EventCreated`, `EventPublished`, `EventCancelled`, `TicketCategoryCreated`, `TicketCategoryDisabled` |
| `booking.ts` | Pending -> Paid / Cancelled / Expired / Refunded | `BookingCreated`, `TicketReserved`, `BookingPaid`, `BookingCancelled`, `BookingExpired` |
| `ticket.ts` | Active -> CheckedIn / Refunded / Cancelled | `TicketCheckedIn` |
| `refund.ts` | Requested -> Approved / Rejected -> PaidOut | `RefundRequested`, `RefundApproved`, `RefundRejected`, `RefundPaidOut` |
| `user.ts` | Organizer / Customer / Admin | -- |
| `promo-code.ts` | Percentage / Fixed discount | -- |

### 2. Entities -- `domain/entities/`

| File | Description |
|---|---|
| `entity.ts` | Base `Entity` interface + `equalsEntity()` function |
| `ticket-category.ts` | Child entity of Event (status: active, comingSoon, salesClosed, soldOut) |

### 3. Value Objects -- `domain/value-objects/`

| File | Invariant |
|---|---|
| `email.ts` | Email format validation |
| `money.ts` | Amount >= 0, currency default IDR |
| `date-range.ts` | End >= Start |
| `ticket-code.ts` | Min 8 chars, generated via nanoid |

### 4. Domain Services -- `domain/domain-services/`

| File | Business Logic |
|---|---|
| `booking.service.ts` | Calculate total price + validate booking request |
| `ticket-availability.service.ts` | Check ticket availability per category |

### 5. Domain Events -- `domain/domain-events/`

**15 domain events:**

| Event | Trigger |
|---|---|
| `EventCreated` | Event created |
| `EventPublished` | Event published |
| `EventCancelled` | Event cancelled |
| `TicketCategoryCreated` | Ticket category added |
| `TicketCategoryDisabled` | Ticket category disabled |
| `BookingCreated` | Booking created |
| `BookingPaid` | Booking paid |
| `BookingCancelled` | Booking cancelled |
| `BookingExpired` | Booking expired |
| `TicketReserved` | Tickets reserved |
| `TicketCheckedIn` | Ticket checked in |
| `RefundRequested` | Refund requested |
| `RefundApproved` | Refund approved |
| `RefundRejected` | Refund rejected |
| `RefundPaidOut` | Refund paid out |

### 6. Repository Interfaces -- `domain/repository-interfaces/`

| Interface | Methods |
|---|---|
| `EventRepository` | findById, findAll, findByOrganizer, save, update, delete |
| `BookingRepository` | findById, findByCustomer, findByEvent, save, update |
| `TicketRepository` | findById, findByBooking, findByEvent, findByCustomer, findByCode, save, update |
| `UserRepository` | findById, findByEmail, save, update |
| `RefundRepository` | findById, findByBooking, save, update |
| `PromoCodeRepository` | findById, findByCode, findAllActive, save, update |

### 7. Domain Unit Tests -- `domain/tests/`

**76 tests -- 0 fail**

| File | Tests | Coverage |
|---|---|---|
| `user-stories.test.ts` | 68 | 12 minimum test cases + user stories + domain event assertions + edge cases |
| `entities.test.ts` | 2 | User entity equality |
| `value-objects.test.ts` | 4 | Email, Money, DateRange, TicketCode |

**12 Minimum Test Cases (AGENT.md SS5):**

| # | Test Case | Status |
|---|---|---|
| 1 | Event cannot be created if end date < start date | Pass |
| 2 | Event cannot be created with capacity <= 0 | Pass |
| 3 | Event cannot be published without active ticket category | Pass |
| 4 | Ticket category quota cannot exceed event capacity | Pass |
| 5 | Booking cannot be created with quantity 0 | Pass |
| 6 | Booking cannot be paid after payment deadline | Pass |
| 7 | Booking cannot be paid with incorrect amount | Pass |
| 8 | Paid booking cannot expire | Pass |
| 9 | Checked-in ticket cannot be checked in again | Pass |
| 10 | Refund cannot be requested if ticket is checked in | Pass |
| 11 | Refund cannot be approved if not in Requested status | Pass |
| 12 | Rejected refund must have a rejection reason | Pass |

```
# Run all tests
bun run test

# Run domain tests only
bun run test:domain

# Run specific file
bun test src/app/main/domain/tests/user-stories.test.ts
```

---

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Framework:** [ElysiaJS](https://elysiajs.com/)
- **Language:** TypeScript
- **Architecture:** Clean Architecture + DDD Tactical Patterns
- **Paradigm:** Functional Programming

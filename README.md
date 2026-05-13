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

### 2. Entities -- `domain/entities/`

| File | Extends | Description |
|---|---|---|
| `entity.ts` | -- | Base `Entity` interface + `equalsEntity()` function |
| `ticket-category.ts` | `Entity` | Child entity of Event (status: active, comingSoon, salesClosed, soldOut) |
| `user.ts` | `Entity` | Standalone entity (roles: organizer, customer, admin) |
| `promo-code.ts` | `Entity` | Standalone entity with validation, usage, deactivation logic |

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
| `user-stories.test.ts` | 68 | All 12 minimum test cases + user stories + domain event assertions + PromoCode/TicketCategory logic |
| `entities.test.ts` | 2 | User entity equality |
| `value-objects.test.ts` | 6 | Email, Money, DateRange, TicketCode |

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

### 8. User Story Implementation Map

| # | User Story | Aggregate / Entity | Domain Event | Domain Service | Status |
|---|---|---|---|---|---|
| 1 | Create Event | `event.ts` -> `createEvent()` | `EventCreated` | -- | ✅ domain |
| 2 | Publish Event | `event.ts` -> `publishEvent()` | `EventPublished` | -- | ✅ domain |
| 3 | Cancel Event | `event.ts` -> `cancelEvent()` | `EventCancelled` | -- | ✅ domain |
| 4 | Create Ticket Category | `event.ts` -> `addCategory()` | `TicketCategoryCreated` | -- | ✅ domain |
| 5 | Disable Ticket Category | `event.ts` -> `disableCategory()` | `TicketCategoryDisabled` | -- | ✅ domain |
| 6 | View Available Events | -- | -- | -- | ❌ app layer |
| 7 | View Event Details | -- | -- | -- | ❌ app layer |
| 8 | Create Ticket Booking | `booking.ts` -> `createBooking()` | `BookingCreated`, `TicketReserved` | `booking.service.ts` | ✅ domain |
| 9 | Calculate Booking Total Price | `booking.ts` -> `getSubtotal()` | -- | `booking.service.ts` | ✅ domain |
| 10 | Pay Booking | `booking.ts` -> `payBooking()` | `BookingPaid` | -- | ✅ domain |
| 11 | Expire Booking | `booking.ts` -> `expireBooking()` | `BookingExpired` | -- | ✅ domain |
| 12 | View Purchased Tickets | -- | -- | -- | ❌ app layer |
| 13 | Check In Ticket | `ticket.ts` -> `checkInTicket()` | `TicketCheckedIn` | -- | ✅ domain |
| 14 | Reject Invalid Ticket Check-in | `ticket.ts` -> `checkInTicket()` (enforced) | -- | -- | ✅ domain |
| 15 | Request Refund | `refund.ts` -> `createRefund()` | `RefundRequested` | -- | ✅ domain |
| 16 | Approve Refund | `refund.ts` -> `approveRefund()` | `RefundApproved` | -- | ✅ domain |
| 17 | Reject Refund | `refund.ts` -> `rejectRefund()` | `RefundRejected` | -- | ✅ domain |
| 18 | Mark Refund as Paid Out | `refund.ts` -> `payoutRefund()` | `RefundPaidOut` | -- | ✅ domain |
| 19 | View Event Sales Report | -- | -- | -- | ❌ app layer |
| 20 | View Event Participants | -- | -- | -- | ❌ app layer |

Status: ✅ domain = logic ada di domain layer (Week 9-10), ❌ app layer = perlu application layer (Week 11)

### 9. Domain Flows by User Story

#### US1: Create Event
```
Input: title, description, startDate, endDate, location, maxCapacity
       │
       ▼
  [event.ts] createEvent()
       │
       ├── Validasi: endDate >= startDate, maxCapacity > 0
       ├── Status: "draft"
       └── Raise: EventCreated
```

#### US2: Publish Event
```
Input: event (status "draft")
       │
       ▼
  [event.ts] publishEvent()
       │
       ├── Validasi: minimal 1 kategori aktif
       ├── Validasi: totalQuota <= maxCapacity
       ├── Status: "published"
       └── Raise: EventPublished
```

#### US3: Cancel Event
```
Input: event (status "draft" | "published")
       │
       ▼
  [event.ts] cancelEvent()
       │
       ├── Validasi: bukan "completed" atau "cancelled"
       ├── Status: "cancelled"
       └── Raise: EventCancelled
```

#### US4: Create Ticket Category (child entity)
```
Input: event, name, price, quota, salesStart, salesEnd
       │
       ▼
  [event.ts] addCategory()
       │
       ├── Validasi: event masih "draft" | "published"
       ├── Validasi: salesEnd <= event.startDate
       ├── Validasi: quota + currentTotal <= maxCapacity
       ├── [ticket-category.ts] createTicketCategory()
       └── Raise: TicketCategoryCreated
```

#### US5: Disable Ticket Category
```
Input: event, categoryId
       │
       ▼
  [event.ts] disableCategory()
       │
       ├── Validasi: event belum "completed"
       ├── [ticket-category.ts] deactivateCategory()
       └── Raise: TicketCategoryDisabled
```

#### US8: Create Ticket Booking
```
Input: eventId, customerId, items[{categoryId, qty}], totalAmount, serviceFee
       │
       ▼
  [booking.ts] createBooking()
       │
       ├── Validasi: items.length > 0
       ├── Validasi: setiap item.quantity > 0
       ├── Validasi: paymentDeadline > createdAt
       ├── Status: "pending"
       ├── Raise: BookingCreated, TicketReserved
       └── [event.ts] reserveCategory() → [ticket-category.ts] reserveCategoryQuota()
```

#### US9: Calculate Booking Total Price
```
Input: booking items
       │
       ▼
  [booking.ts] getSubtotal()
       │
       └── Sum(item.unitPrice × item.quantity) + serviceFee
```

#### US10: Pay Booking
```
Input: booking (status "pending"), amount
       │
       ▼
  [booking.ts] payBooking()
       │
       ├── Validasi: status === "pending"
       ├── Validasi: now <= paymentDeadline
       ├── Validasi: amount === totalAmount
       ├── Status: "paid", paidAt: now
       └── Raise: BookingPaid
```

#### US11: Expire Booking
```
Input: booking (status "pending")
       │
       ▼
  [booking.ts] expireBooking()
       │
       ├── Validasi: status === "pending"
       ├── Status: "expired"
       └── Raise: BookingExpired
```

#### US13: Check In Ticket
```
Input: ticket (status "active"), eventId
       │
       ▼
  [ticket.ts] checkInTicket()
       │
       ├── Validasi: ticket.eventId === eventId
       ├── Validasi: status === "active"
       ├── Status: "checkedIn", checkedInAt: now
       └── Raise: TicketCheckedIn
```

#### US14: Reject Invalid Ticket Check-in
```
Input: ticket (status "checkedIn" | "refunded" | "cancelled"), eventId
       │
       ▼
  [ticket.ts] checkInTicket()
       │
       ├── ❌ Validasi gagal: ticket.eventId !== eventId  → throw "Ticket does not match the event"
       └── ❌ Validasi gagal: status !== "active"        → throw "Ticket is not active"
```

#### US15: Request Refund
```
Input: bookingId, amount, reason
       │
       ▼
  [refund.ts] createRefund()
       │
       ├── [booking.ts] markBookingRefunded() → validasi status "paid"
       ├── [ticket.ts] markTicketRefunded()   → validasi status "active"
       ├── Status: "requested"
       └── Raise: RefundRequested
```

#### US16: Approve Refund
```
Input: refund (status "requested")
       │
       ▼
  [refund.ts] approveRefund()
       │
       ├── Validasi: status === "requested"
       ├── Status: "approved", resolvedAt: now
       └── Raise: RefundApproved
```

#### US17: Reject Refund
```
Input: refund (status "requested"), reason
       │
       ▼
  [refund.ts] rejectRefund()
       │
       ├── Validasi: status === "requested"
       ├── Status: "rejected", resolvedAt: now, rejectionReason: reason
       └── Raise: RefundRejected
```

#### US18: Mark Refund as Paid Out
```
Input: refund (status "approved"), paymentReference
       │
       ▼
  [refund.ts] payoutRefund()
       │
       ├── Validasi: status === "approved"
       ├── Status: "paidOut", paymentReference: ref
       └── Raise: RefundPaidOut
```

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

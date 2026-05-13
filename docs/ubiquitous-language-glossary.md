# Ubiquitous Language Glossary

| Term | Meaning |
|------|---------|
| Event | An activity organized by an Event Organizer and attended by customers. Has a status of Draft, Published, Cancelled, or Completed. |
| Event Organizer | A user who creates and manages events. |
| Customer | A user who browses events, books tickets, makes payments, and requests refunds. |
| Gate Officer | A user who validates tickets and performs check-in during an event. |
| System Admin | A user who manages refund payouts and monitors operations. |
| Ticket Category | A type of ticket (e.g., Regular, VIP, Early Bird) with a name, price, quota, and sales period. |
| Quota | The maximum number of tickets available for sale within a ticket category. |
| Remaining | The number of tickets still available in a ticket category after reservations. |
| Sales Period | The date range during which a ticket category can be purchased, defined by a sales start date and sales end date. |
| Booking | A temporary reservation of tickets created before payment is completed. Has status of Pending, Paid, Cancelled, Expired, or Refunded. |
| Pending Payment | A booking status indicating the customer has created a reservation but payment has not yet been completed. |
| Paid | A booking status indicating payment has been successfully completed and tickets have been issued. |
| Expired | A booking status indicating the payment deadline has passed without payment. |
| Cancelled | A booking status indicating the reservation has been cancelled before payment. |
| Refunded | A booking status indicating the booking amount has been refunded to the customer. |
| Payment Deadline | The time limit for completing payment after a booking is created, typically 15 minutes. |
| Ticket | Proof of attendance generated for each ticket unit after a booking is paid. Each ticket has a unique code. |
| Ticket Code | A unique alphanumeric code used to identify and validate a ticket during check-in. |
| Check-in | The process of validating a ticket when a participant enters the event venue. Changes ticket status from Active to CheckedIn. |
| Active | A ticket status indicating the ticket is valid and can be used for check-in. |
| CheckedIn | A ticket status indicating the ticket has been used for event entry. |
| Refund | The process of returning money to a customer after a refund request is approved. |
| Refund Request | A request initiated by a Customer to get their money back. Has status of Requested, Approved, Rejected, or PaidOut. |
| Requested | A refund status indicating the customer has initiated a refund request. |
| Approved | A refund status indicating the Event Organizer has approved the refund request. |
| Rejected | A refund status indicating the Event Organizer has rejected the refund request with a reason. |
| PaidOut | A refund status indicating the System Admin has processed the refund payment. |
| Money | A value object representing a monetary amount with a currency (default: IDR). Cannot be negative. |
| Email | A value object representing an email address with format validation. |
| DateRange | A value object representing a time range with start and end dates. |
| Draft | An event status indicating the event has been created but is not yet visible to customers. |
| Published | An event status indicating the event is visible to customers and tickets can be purchased. |
| Cancelled (Event) | An event status indicating the event has been cancelled and ticket sales are stopped. |
| Completed (Event) | An event status indicating the event date has passed. |
| Domain Event | A record of something that happened in the domain (e.g., EventCreated, BookingPaid). |
| Aggregate | A cluster of domain objects treated as a single unit (e.g., Event aggregate contains TicketCategory entities). |
| Service Fee | An additional fee added to the total booking price. |

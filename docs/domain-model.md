# Domain Model

## Bounded Areas Found In Code

- Identity and users
  - `apps/identity/src/*`
  - `libs/shared/src/entities/user.entity.ts`
- Billiard tables and table photos
  - `apps/billiard-tables/src/*`
  - `libs/shared/src/entities/billiard-table.entity.ts`
  - `libs/shared/src/entities/billiard-table-photo.entity.ts`
- Bookings
  - `apps/booking/src/*`
  - `libs/shared/src/entities/booking.entity.ts`
- Notification and storage are infrastructure services, not domain aggregates.

## Entities

### User

- Entity: `libs/shared/src/entities/user.entity.ts`
- DTOs: `libs/shared/src/dtos/user.dto.ts`
- Fields:
  - `id`
  - `email`
  - `password`
  - `name`
  - `surname`
  - `photoFilename`
  - `role`
  - `status`

### Billiard Table

- Entity: `libs/shared/src/entities/billiard-table.entity.ts`
- DTOs: `libs/shared/src/dtos/billiard-table.dto.ts`
- Fields:
  - `id`
  - `title`
  - `description`
  - `hourlyPrice`
  - `type`
  - `status`
  - `photos`

### Billiard Table Photo

- Entity: `libs/shared/src/entities/billiard-table-photo.entity.ts`
- Fields:
  - `id`
  - `billiardTableId`
  - `photoFilename`

### Booking

- Entity: `libs/shared/src/entities/booking.entity.ts`
- DTOs: `libs/shared/src/dtos/booking.dto.ts`
- Fields:
  - `id`
  - `userId`
  - `billiardTableId`
  - `status`
  - `startTime`
  - `endTime`
  - `totalCost`
  - `createdAt`
  - `updatedAt`

## Relationships

- `BookingEntity.userId -> UserEntity.id`
  - nullable
  - `onDelete: SET NULL`
- `BookingEntity.billiardTableId -> BilliardTableEntity.id`
  - nullable
  - `onDelete: SET NULL`
- `BilliardTablePhotoEntity -> BilliardTableEntity`
  - `onDelete: CASCADE`

## Use Cases Found In Code

- User:
  - register, activate, login, refresh, update, delete, photo upload/delete, list
- Billiard table:
  - create, read, update, delete, add photos, remove selected photos
- Booking:
  - create, update status, query booked slots, list bookings

Key service sources:

- `apps/identity/src/identity.service.ts`
- `apps/billiard-tables/src/billiard-tables.service.ts`
- `apps/booking/src/booking.service.ts`

## Business Rules Proven By Code

### User rules

- New users default to:
  - `role = User`
  - `status = Pending`
- Email must be unique.
- Login is rejected when:
  - password is invalid
  - user is `Pending`
  - user is `Blocked`
- Activation changes status from `Pending` to `Active`.
- Simplified users list returns only active users with role `User`.

### Table rules

- Table title must be unique.
- Current default table status is `Maintenance`.
- Photo operations persist filenames in DB and objects in storage.

### Booking rules

- `startTime` must be in the future.
- `startTime` can be created only for today or the next 7 days.
- `startTime` must be before `endTime`.
- Booking duration must be between 30 minutes and 5 hours.
- Booking start and end must align with 15-minute slot boundaries.
- Booking time must stay within club working hours:
  - from `09:00`
  - to `24:00`
- User and table must exist.
- Overlapping active bookings are blocked.
- Overlap check excludes statuses:
  - `Cancelled`
  - `Rejected`
- `totalCost = durationHours * hourlyPrice`
- New bookings start as `Pending`.
- Valid status progression:
  - `Pending -> Confirmed`
  - `Confirmed -> Paid`
  - terminal pre-payment statuses can be set to `Cancelled` or `Rejected`

## Aggregate / DDD Notes

- Explicit aggregate root classes are NOT FOUND IN CODEBASE.
- Repositories are direct TypeORM repositories injected into services.
- Domain rules live inside service classes.

## Example

```text
Booking totalCost
= (endTime - startTime in hours)
* billiard table hourlyPrice
```

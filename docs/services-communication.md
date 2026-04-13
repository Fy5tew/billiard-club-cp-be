# Services Communication

## Transport

- Internal communication uses RabbitMQ with `Transport.RMQ`.
- Client registration is centralized in `libs/shared/src/helpers/register-client.util.ts`.
- Each service has its own queue from config:
  - `IDENTITY.RMQ_QUEUE`
  - `BILLIARD_TABLES.RMQ_QUEUE`
  - `BOOKING.RMQ_QUEUE`
  - `NOTIFICATION.RMQ_QUEUE`
  - `STORAGE.RMQ_QUEUE`

## Communication Pattern

- RPC request/response:
  - implemented with `client.send(...)`
  - used by identity, billiard tables, booking, storage
- fire-and-forget event style:
  - implemented with `client.emit(...)`
  - used by notification email send
  - used by storage delete file

## Shared Service Contracts

### Identity

- Message enum: `libs/shared/src/services/identity/identity.messages.ts`
- Client wrapper: `libs/shared/src/services/identity/identity.client.ts`
- Messages:
  - `register`
  - `activate`
  - `login`
  - `refresh`
  - `update_by_id`
  - `update_photo_by_id`
  - `delete_photo_by_id`
  - `get_by_id`
  - `delete_by_id`
  - `get_users`
  - `get_users_simplified`

### Billiard Tables

- Message enum: `libs/shared/src/services/billiard-tables/billiard-tables.messages.ts`
- Client wrapper: `libs/shared/src/services/billiard-tables/billiard-tables.client.ts`
- Messages:
  - `create`
  - `get_tables`
  - `get_by_id`
  - `update_by_id`
  - `add_photos`
  - `update_photos`
  - `delete_by_id`

### Booking

- Message enum: `libs/shared/src/services/booking/booking.messages.ts`
- Client wrapper: `libs/shared/src/services/booking/booking.client.ts`
- Messages:
  - `create`
  - `update_status_by_id`
  - `get_booked_slots_by_billiard_table_id`
  - `get_bookings`
  - `get_upcoming_bookings`
  - `get_by_id`
  - `get_by_user_id`
  - `get_by_billiard_table_id`

### Notification

- Message enum: `libs/shared/src/services/notification/notification.messages.ts`
- Client wrapper: `libs/shared/src/services/notification/notification.client.ts`
- Event:
  - `send_email`

### Storage

- Message enum: `libs/shared/src/services/storage/storage.messages.ts`
- Client wrapper: `libs/shared/src/services/storage/storage.client.ts`
- Messages/events:
  - `upload_file`
  - `get_file_url`
  - `delete_file`

## Actual Service Dependencies

### `api-gateway`

- depends on:
  - `identity`
  - `billiard-tables`
  - `booking`
- source: `apps/api-gateway/src/api-gateway.module.ts`

### `identity`

- depends on:
  - `notification`
  - `storage`
- source: `apps/identity/src/identity.module.ts`

### `billiard-tables`

- depends on:
  - `storage`
- source: `apps/billiard-tables/src/billiard-tables.module.ts`

### `booking`

- depends on:
  - `identity`
  - `billiard-tables`
- source: `apps/booking/src/booking.module.ts`

### `notification`

- no internal service clients found in codebase

### `storage`

- no internal service clients found in codebase

## End-to-End Examples

### Login flow

1. `AuthController.login()` in `apps/api-gateway/src/controllers/auth.controller.ts`
2. `IdentityClient.login()`
3. RMQ message `IdentityMessage.LOGIN`
4. `IdentityController.login()`
5. `IdentityService.login()`
6. response `TokensDto`

### Create booking flow

1. `BookingsController.create()`
2. `BookingClient.create()`
3. `BookingController.create()`
4. `BookingService.create()`
5. `BookingService.create()` calls:
   - `BilliardTablesClient.getById()`
   - `IdentityClient.getById()`
6. booking saved to PostgreSQL
7. response `BookingDto`

### Update user photo flow

1. `UsersController.updateCurrentPhoto()`
2. `IdentityClient.updatePhotoById()`
3. `IdentityService.updateEntityPhotoById()`
4. `StorageClient.uploadFile()`
5. `StorageController.uploadFile()`
6. object stored in MinIO

## Failure Handling Across Service Boundary

- Microservices convert `HttpException` to `RpcException` with `HttpToRpcExceptionFilter`.
- Gateway converts `RpcException` back to HTTP JSON with `RpcToHttpExceptionFilter`.
- `RpcClientErrorInterceptor` unwraps serialized RPC errors before the HTTP filter handles them.

## What Is Not Used

- `EventPattern` is NOT FOUND IN CODEBASE.
- HTTP calls between microservices are NOT FOUND IN CODEBASE.
- Queue/topic fan-out beyond direct service queues is NOT FOUND IN CODEBASE.

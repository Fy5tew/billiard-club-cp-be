# API Contracts

## HTTP API Entry Point

- Application: `apps/api-gateway`
- Main bootstrap: `apps/api-gateway/src/main.ts`
- Swagger:
  - `/docs/swagger`
  - `/docs/openapi.json`

## Auth API

### `POST /auth/register`

- Controller: `apps/api-gateway/src/controllers/auth.controller.ts`
- Request DTO: `CreateUserDto`
- Response DTO: `UserDto`

### `POST /auth/activate`

- Request DTO: `ActivationTokenDto`
- Response: `null`

### `POST /auth/login`

- Request DTO: `LoginDto`
- Response DTO: `AccessTokenDto`
- Side effect:
  - sets `refresh_token` cookie

### `GET /auth/refresh`

- Guard: `JwtRefreshGuard`
- Response DTO: `AccessTokenDto`

### `GET /auth/logout`

- Guard: `JwtRefreshGuard`
- Side effect:
  - clears `refresh_token` cookie

## Users API

Controller: `apps/api-gateway/src/controllers/users.controller.ts`

- `GET /users` -> `UserDto[]`
- `GET /users/simplified` -> `SimplifiedUserDto[]`
- `GET /users/current` -> `UserDto`
- `PUT /users/current` -> `UpdateUserProfileDto` -> `UserDto`
- `POST /users/current/photo` -> multipart `file` -> `UserDto`
- `DELETE /users/current/photo` -> `UserDto`
- `DELETE /users/current` -> `UserDto`
- `GET /users/:id` -> `UserDto`
- `PUT /users/:id` -> `UpdateUserDto` -> `UserDto`
- `POST /users/:id/photo` -> multipart `file` -> `UserDto`
- `DELETE /users/:id/photo` -> `UserDto`
- `DELETE /users/:id` -> `UserDto`

## Billiard Tables API

Controller: `apps/api-gateway/src/controllers/billiard-tables.controller.ts`

- `POST /tables` -> `CreateBilliardTableDto` -> `BilliardTableDto`
- `GET /tables` -> `BilliardTableDto[]`
- `GET /tables/:id` -> `BilliardTableDto`
- `PUT /tables/:id` -> `UpdateBilliardTableDto` -> `BilliardTableDto`
- `PUT /tables/:id/status` -> `UpdateBilliardTableStatusDto` -> `BilliardTableDto`
- `POST /tables/:id/photos` -> multipart `photos[]` -> `BilliardTableDto`
- `PUT /tables/:id/photos` -> `UpdateBilliardTablePhotosDto` -> `BilliardTableDto`
- `DELETE /tables/:id` -> `BilliardTableDto`

Example body:

```json
{
  "title": "Table 1",
  "description": "Near the window",
  "hourlyPrice": 20,
  "type": "POOL"
}
```

## Bookings API

Controller: `apps/api-gateway/src/controllers/bookings.controller.ts`

- `GET /bookings` -> `BookingFullDto[]`
- `GET /bookings/upcoming` -> `BookingFullDto[]`
- `POST /bookings` -> `CreateBookingDto` -> `BookingDto`
- `POST /bookings/manual` -> `CreateBookingManualDto` -> `BookingDto`
- `GET /bookings/slots/:billiardTableId` + `GetBookedSlotsDto` query -> `BookedSlotDto[]`
- `GET /bookings/my` -> `BookingFullDto[]`
- `GET /bookings/:id` -> `BookingFullDto`
- `GET /bookings/users/:userId` -> `BookingFullDto[]`
- `GET /bookings/tables/:billiardTableId` -> `BookingFullDto[]`
- `PUT /bookings/:id/status` -> `UpdateBookingStatusDto` -> `BookingDto`
- `POST /bookings/:id/cancel` -> `BookingDto`
- `POST /bookings/:id/confirm` -> `BookingDto`
- `POST /bookings/:id/reject` -> `BookingDto`
- `POST /bookings/:id/pay/manual` -> `BookingDto`
- `POST /bookings/:id/pay` -> `BookingDto`

## News API

Controller: `apps/api-gateway/src/controllers/news.controller.ts`

- `GET /news` + `GetPublicNewsQueryDto` query -> `NewsDto[]`
- `GET /news/tags` -> `string[]`
- `GET /news/:id` -> `NewsDto`
- `GET /news/manage` + `GetManageNewsQueryDto` query -> `NewsDto[]`
- `GET /news/manage/tags` -> `string[]`
- `GET /news/manage/:id` -> `NewsDto`
- `POST /news/manage` -> `CreateNewsDto` -> `NewsDto`
- `PATCH /news/manage/:id` -> `UpdateNewsDto` -> `NewsDto`
- `PATCH /news/manage/:id/status` -> `UpdateNewsStatusDto` -> `NewsDto`
- `POST /news/manage/:id/cover` -> multipart `file` -> `NewsDto`
- `DELETE /news/manage/:id/cover` -> `NewsDto`
- `DELETE /news/manage/:id` -> `NewsDto`

## Validation Notes

- Global `ValidationPipe({ transform: true })` is enabled in `apps/api-gateway/src/main.ts`.
- DTOs use `class-validator` and `class-transformer`.
- Some parameters use `ParseUUIDPipe`, but not all route params do.

## Authorization Notes

- Public routes are marked with `@PublicRoute()`.
- Role metadata is attached with `@RoleAccess(...)`.
- `RoleAccessGuard` runtime registration is NOT FOUND IN CODEBASE.

# Architecture

## Overview

- The repository is a NestJS monorepo (`nest-cli.json`) with:
  - one HTTP entry service: `apps/api-gateway`
  - six RMQ-backed apps: `apps/identity`, `apps/billiard-tables`, `apps/booking`, `apps/tournaments`, `apps/notification`, `apps/storage`
  - one migration app: `apps/migrations`
  - one shared library: `libs/shared`
- Transport split:
  - HTTP/JSON is exposed only by `apps/api-gateway/src/main.ts`
  - internal communication uses RabbitMQ via `Transport.RMQ` in each microservice `main.ts`
- Persistence split:
  - PostgreSQL is used by `identity`, `billiard-tables`, and `booking`
  - MinIO is used by `storage`
  - SMTP is used by `notification`

## Runtime Boundaries

### `api-gateway`

- Main file: `apps/api-gateway/src/main.ts`
- Module: `apps/api-gateway/src/api-gateway.module.ts`
- Responsibility:
  - exposes REST endpoints
  - configures Swagger
  - applies HTTP auth, cookies, CORS, validation, and RPC-to-HTTP error mapping
- It does not access the database directly.

### `identity`

- Main file: `apps/identity/src/main.ts`
- Module: `apps/identity/src/identity.module.ts`
- Responsibility:
  - user registration
  - activation
  - login / token refresh
  - user CRUD
  - profile photo upload/delete
- Dependencies:
  - PostgreSQL (`UserEntity`)
  - `notification`
  - `storage`

### `billiard-tables`

- Main file: `apps/billiard-tables/src/main.ts`
- Module: `apps/billiard-tables/src/billiard-tables.module.ts`
- Responsibility:
  - table CRUD
  - table status update
  - table photo add/delete
- Dependencies:
  - PostgreSQL (`BilliardTableEntity`, `BilliardTablePhotoEntity`)
  - `storage`

### `booking`

- Main file: `apps/booking/src/main.ts`
- Module: `apps/booking/src/booking.module.ts`
- Responsibility:
  - create bookings
  - validate overlaps
  - manage status transitions
  - query booked slots and booking lists
- Dependencies:
  - PostgreSQL (`BookingEntity`)
  - no direct domain data dependencies on other business services

### `tournaments`

- Main file: `apps/tournaments/src/main.ts`
- Module: `apps/tournaments/src/tournaments.module.ts`
- Responsibility:
  - tournament CRUD
  - publish/cancel/start/complete tournament lifecycle
  - tournament registration lifecycle
- Dependencies:
  - PostgreSQL (`TournamentEntity`, `TournamentRegistrationEntity`)

### `notification`

- Main file: `apps/notification/src/main.ts`
- Module: `apps/notification/src/notification.module.ts`
- Responsibility:
  - send emails
- No domain persistence found in codebase.

### `storage`

- Main file: `apps/storage/src/main.ts`
- Module: `apps/storage/src/storage.module.ts`
- Responsibility:
  - upload file
  - get presigned file URL
  - delete file
- No database usage found in codebase.

## Shared Building Blocks

- Config:
  - `libs/shared/src/config/config.module.ts`
  - `libs/shared/src/config/config.service.ts`
  - `libs/shared/src/config/config.validation.ts`
- Transport registration:
  - `libs/shared/src/helpers/register-client.util.ts`
- Database registration:
  - `libs/shared/src/helpers/register-database.util.ts`
- JWT registration:
  - `libs/shared/src/helpers/register-jwt.util.ts`
- Shared client wrappers:
  - `libs/shared/src/services/*/*.client.ts`
- Shared message names:
  - `libs/shared/src/services/*/*.messages.ts`
- Shared DTOs/entities:
  - `libs/shared/src/dtos/*`
  - `libs/shared/src/entities/*`

## Request Flow

1. Request enters an HTTP controller in `apps/api-gateway/src/controllers/*`.
2. `api-gateway` resolves any data needed from multiple services and composes the command/query payload.
3. Controller calls a shared client such as `IdentityClient`, `BookingClient`, or `BilliardTablesClient`.
4. The client sends an RMQ message using a name from `libs/shared/src/services/*/*.messages.ts`.
5. Target microservice handles the message in its controller with `@MessagePattern(...)`.
6. Service layer performs business logic and repository access using only local persistence and prepared input parameters.
7. Result is mapped to a DTO and returned to the gateway.
8. `RpcToHttpExceptionFilter` converts RPC errors back into HTTP responses.

## Service Interaction Rule

- Business microservices must stay isolated from each other for domain data reads.
- `api-gateway` is the aggregation boundary for cross-service data.
- Direct service-to-service calls are only allowed for:
  - `storage`
  - `notification`

## Architectural Style Observed In Code

- Layered structure:
  - controller -> service -> repository/client
- Contract-first internal communication:
  - shared DTOs
  - shared message enums
  - shared client wrappers
- Not found in codebase:
  - CQRS package usage
  - event sourcing
  - aggregate root classes separate from entities

## Important Implementation Notes

- Every microservice bootstraps with:
  - `ValidationPipe({ transform: true })`
  - `ClassSerializerInterceptor`
  - `HttpToRpcExceptionFilter`
- `api-gateway` bootstraps with:
  - `JwtAccessAuthGuard`
  - `RpcClientErrorInterceptor`
  - `RpcToHttpExceptionFilter`
  - Swagger at `/docs/swagger`
- `@RoleAccess(...)` metadata is used in gateway controllers.
- `RoleAccessGuard` exists in `apps/api-gateway/src/auth/role-access.guard.ts`.
- I did not find `RoleAccessGuard` registered in `apps/api-gateway/src/main.ts`, `apps/api-gateway/src/api-gateway.module.ts`, or via `APP_GUARD`.

## Example

```text
POST /bookings
-> apps/api-gateway/src/controllers/bookings.controller.ts
-> IdentityClient.getById()
-> BilliardTablesClient.getById()
-> BookingClient.create()
-> BookingMessage.CREATE
-> apps/booking/src/booking.controller.ts
-> BookingService.create()
-> BookingEntity repository
-> BookingDto
```

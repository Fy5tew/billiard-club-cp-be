# Coding Guidelines

## Working Style Already Established

- Keep transport contracts in `libs/shared/src/dtos/*` and `libs/shared/src/services/*`.
- Keep app logic in service classes, not in controllers.
- Use shared helper registration:
  - `registerClient(...)`
  - `registerDatabase()`
  - `registerJwt()`
- Use `plainToInstance(..., { excludeExtraneousValues: true })` before returning DTOs from services.
- Keep RMQ message names centralized in `*.messages.ts`.

## How To Add A New Module

This repository currently uses one app-level module per application, not nested feature modules.

For a new microservice:

1. Add a new application in `apps/<service-name>`.
2. Create:
   - `src/main.ts`
   - `src/<service-name>.module.ts`
   - `src/<service-name>.controller.ts`
   - `src/<service-name>.service.ts`
3. Register the project in `nest-cli.json`.
4. If the service needs RMQ clients, import `registerClient(Service.X)`.
5. If the service needs Postgres, import `registerDatabase()` and `TypeOrmModule.forFeature(...)`.
6. Add shared contracts:
   - DTOs in `libs/shared/src/dtos`
   - message enum in `libs/shared/src/services/<service>/<service>.messages.ts`
   - typed client in `libs/shared/src/services/<service>/<service>.client.ts`
7. Add Docker support if needed:
   - `apps/<service>/Dockerfile`
   - service block in `docker-compose.yaml`

## How To Add A New Endpoint

For a new HTTP endpoint in the API gateway:

1. Add the route to the relevant controller in `apps/api-gateway/src/controllers/*`.
2. Reuse an existing shared client or add a new RMQ message/client method.
3. Add or reuse DTOs in `libs/shared/src/dtos/*`.
4. Add Swagger decorators.
5. If route is public, add `@PublicRoute()`.
6. If route should be role-protected, add `@RoleAccess(...)`, but note the current guard wiring gap below.

## How To Extend The Domain

For a new persisted concept:

1. Add a new entity in `libs/shared/src/entities`.
2. Add DTOs in `libs/shared/src/dtos`.
3. Register the entity in the relevant app with `TypeOrmModule.forFeature(...)`.
4. Add a migration in `apps/migrations/src/migrations`.
5. Implement service methods that:
   - validate input
   - load required related records
   - map entity to DTO before returning
6. If other services must call it, add shared RMQ message names and a typed client wrapper.

## What Not To Do

- Do not hardcode RMQ message strings inside controllers or services.
- Do not bypass shared client wrappers and inject raw `ClientProxy` in random feature code.
- Do not return TypeORM entities directly when the current apps map to DTOs.
- Do not put domain persistence into `api-gateway`.
- Do not assume `@RoleAccess(...)` alone enforces authorization.
  - `RoleAccessGuard` exists, but registration is NOT FOUND IN CODEBASE.
- Do not introduce HTTP calls between services unless architecture is intentionally changed.

## Anti-Patterns Already Visible In This Repo

- `apps/booking/src/booking.module.ts` includes extra entities with comment:
  - `// TODO: No need this entities`
- `BookingsController.createManual()` returns before the follow-up status update finishes.
- Several storage deletions are emitted without awaiting completion:
  - `IdentityService.updateEntityPhotoById()`
  - `BilliardTablesService.updateEntityPhotos()`
  - `BilliardTablesService.deleteEntityById()`

## Conventions To Preserve

- Use class-based DTOs with `class-validator`.
- Use shared enums for statuses and roles.
- Use helper utilities for storage paths:
  - `apps/identity/src/identity.utils.ts`
  - `apps/billiard-tables/src/billiard-tables.utils.ts`
- Keep exception mapping near the service layer.

## Example

```text
New booking report endpoint
-> add DTO in libs/shared/src/dtos/booking.dto.ts
-> add message in libs/shared/src/services/booking/booking.messages.ts
-> add client method in libs/shared/src/services/booking/booking.client.ts
-> handle in apps/booking/src/booking.controller.ts
-> expose route in apps/api-gateway/src/controllers/bookings.controller.ts
```

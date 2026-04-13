# How To Add A Feature

## Goal

This guide follows the current repository architecture:

- HTTP entry in `api-gateway`
- domain logic in microservices
- shared DTO/message/client contracts in `libs/shared`

## Standard Feature Checklist

1. Decide which service owns the business rule.
2. Add or update DTOs in `libs/shared/src/dtos`.
3. Add or update RMQ message names in `libs/shared/src/services/<service>/*.messages.ts`.
4. Add or update shared client wrappers in `libs/shared/src/services/<service>/*.client.ts`.
5. Implement `@MessagePattern(...)` handler in the target microservice controller.
6. Implement business logic in the target service class.
7. If persistence changes are needed:
   - update entity
   - add migration
8. Expose or update HTTP endpoint in `apps/api-gateway/src/controllers/*`.
9. Add Swagger decorators for the new HTTP contract.
10. Verify error flow and DTO serialization.

## Example: Add A New Read-Only Booking Query

1. Add DTO/query DTO in `libs/shared/src/dtos/booking.dto.ts`.
2. Add message name to `libs/shared/src/services/booking/booking.messages.ts`.
3. Add client method to `libs/shared/src/services/booking/booking.client.ts`.
4. Add handler in `apps/booking/src/booking.controller.ts`.
5. Add logic in `apps/booking/src/booking.service.ts`.
6. Add route in `apps/api-gateway/src/controllers/bookings.controller.ts`.

## Example: Add A New Persisted Domain Field

1. Update entity in `libs/shared/src/entities/*`.
2. Update DTO in `libs/shared/src/dtos/*`.
3. Create migration in `apps/migrations/src/migrations`.
4. Update service mapping code.
5. Expose the field through message handlers and HTTP endpoints.

## Example: Add A New File Upload Use Case

1. Accept multipart file in gateway controller with `FileInterceptor` or `FilesInterceptor`.
2. Convert the uploaded file to shared DTO shape:
   - `filename`
   - `buffer`
   - `mimeType`
3. Send it to the owning microservice.
4. In that microservice, call `StorageClient.uploadFile(...)`.
5. Persist filename/path metadata in PostgreSQL.
6. Generate access URL via `StorageClient.getFileUrl(...)` when mapping DTOs.

## Feature Placement Rules

- Put HTTP-only concerns in gateway:
  - cookies
  - multipart parsing
  - Swagger annotations
- Put domain rules in owning microservice.
- Put cross-service contracts in `libs/shared`.

## Verification Checklist

- Does the feature live in the correct service?
- Are message names defined only once in shared enums?
- Are DTOs shared rather than duplicated across apps?
- Are exceptions thrown as `HttpException` subclasses?
- If DB schema changed, was a migration added?
- If a route uses role restrictions, did you remember current `RoleAccessGuard` registration is NOT FOUND IN CODEBASE?

## What To Avoid While Adding Features

- Duplicating DTOs inside `apps/*`
- Adding direct Postgres access to `api-gateway`
- Skipping migration files when entity shape changes
- Returning raw storage filenames when the rest of the API returns presigned URLs
- Introducing new transport styles without updating shared conventions

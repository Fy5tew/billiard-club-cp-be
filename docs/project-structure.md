# Project Structure

## Top Level

- `apps/`
  - executable NestJS applications
- `libs/shared/`
  - shared DTOs, entities, config, helpers, message enums, and client wrappers
- `scripts/`
  - utility scripts, currently migration command wrapper
- `docker-compose.yaml`
  - local infrastructure and service orchestration
- `nest-cli.json`
  - Nest monorepo project registry

## Applications

### `apps/api-gateway`

- Purpose: public HTTP API
- Key files:
  - `apps/api-gateway/src/main.ts`
  - `apps/api-gateway/src/api-gateway.module.ts`
  - `apps/api-gateway/src/controllers/auth.controller.ts`
  - `apps/api-gateway/src/controllers/users.controller.ts`
  - `apps/api-gateway/src/controllers/billiard-tables.controller.ts`
  - `apps/api-gateway/src/controllers/bookings.controller.ts`
  - `apps/api-gateway/src/auth/*`
  - `apps/api-gateway/src/constants/*`
  - `apps/api-gateway/src/config/docs.config.ts`

### `apps/identity`

- Purpose: user/auth domain service
- Key files:
  - `apps/identity/src/main.ts`
  - `apps/identity/src/identity.module.ts`
  - `apps/identity/src/identity.controller.ts`
  - `apps/identity/src/identity.service.ts`
  - `apps/identity/src/identity.constants.ts`
  - `apps/identity/src/identity.utils.ts`

### `apps/billiard-tables`

- Purpose: billiard table catalog and photos
- Key files:
  - `apps/billiard-tables/src/main.ts`
  - `apps/billiard-tables/src/billiard-tables.module.ts`
  - `apps/billiard-tables/src/billiard-tables.controller.ts`
  - `apps/billiard-tables/src/billiard-tables.service.ts`
  - `apps/billiard-tables/src/billiard-tables.constants.ts`
  - `apps/billiard-tables/src/billiard-tables.utils.ts`

### `apps/booking`

- Purpose: booking lifecycle and booking queries
- Key files:
  - `apps/booking/src/main.ts`
  - `apps/booking/src/booking.module.ts`
  - `apps/booking/src/booking.controller.ts`
  - `apps/booking/src/booking.service.ts`

### `apps/notification`

- Purpose: email delivery
- Key files:
  - `apps/notification/src/main.ts`
  - `apps/notification/src/notification.module.ts`
  - `apps/notification/src/notification.controller.ts`
  - `apps/notification/src/notification.service.ts`

### `apps/storage`

- Purpose: object storage abstraction over MinIO
- Key files:
  - `apps/storage/src/main.ts`
  - `apps/storage/src/storage.module.ts`
  - `apps/storage/src/storage.controller.ts`
  - `apps/storage/src/storage.service.ts`

### `apps/migrations`

- Purpose: TypeORM migration datasource and migration files
- Key files:
  - `apps/migrations/src/data-source.ts`
  - `apps/migrations/src/migrations/*.ts`

## Shared Library Layout

### `libs/shared/src/config`

- `config.module.ts`: exports `ConfigService`
- `config.service.ts`: runtime config object
- `config.validation.ts`: `zod` schema for all environment groups
- `load-config.ts`: loads `.env` via `dotenv` + `nconf`

### `libs/shared/src/dtos`

- `auth.dto.ts`
- `user.dto.ts`
- `billiard-table.dto.ts`
- `booking.dto.ts`
- `notification.dto.ts`
- `storage.dto.ts`

### `libs/shared/src/entities`

- `user.entity.ts`
- `billiard-table.entity.ts`
- `billiard-table-photo.entity.ts`
- `booking.entity.ts`

### `libs/shared/src/helpers`

- `register-client.util.ts`
- `register-database.util.ts`
- `register-jwt.util.ts`
- `http-to-rpc-exception.filter.ts`
- `rpc-to-http-exception.filter.ts`
- `rpc-client-error.interceptor.ts`
- `catch-database-error.decorator.ts`

### `libs/shared/src/services`

- `identity/`
- `billiard-tables/`
- `booking/`
- `notification/`
- `storage/`
- `services.types.ts`

Pattern inside each service folder:

- `*.messages.ts`: RMQ message names
- `*.client.ts`: typed wrapper over `ClientProxy`

## Dependency Direction

- `apps/api-gateway` depends on `libs/shared`
- microservices depend on `libs/shared`
- shared library does not depend on `apps/*`
- cross-service calls are made through `libs/shared/src/services/*/*.client.ts`

## Structural Patterns Seen Repeatedly

- Per application:
  - `main.ts`
  - single app module
  - controller
  - service
- DTOs and entities live centrally in `libs/shared`
- Message names are centralized and imported, not duplicated as raw strings

## Example Navigation

- To trace login:
  - `apps/api-gateway/src/controllers/auth.controller.ts`
  - `libs/shared/src/services/identity/identity.client.ts`
  - `libs/shared/src/services/identity/identity.messages.ts`
  - `apps/identity/src/identity.controller.ts`
  - `apps/identity/src/identity.service.ts`

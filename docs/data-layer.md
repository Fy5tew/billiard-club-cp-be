# Data Layer

## Primary Persistence

- Database: PostgreSQL
- ORM: TypeORM
- Registration helper: `libs/shared/src/helpers/register-database.util.ts`
- Entity auto-loading is enabled with `autoLoadEntities: true`

## Entities Stored In PostgreSQL

- `UserEntity` -> table `users`
- `BilliardTableEntity` -> table `billiard_tables`
- `BilliardTablePhotoEntity` -> table `billiard_table_photos`
- `BookingEntity` -> table `bookings`

Sources:

- `libs/shared/src/entities/user.entity.ts`
- `libs/shared/src/entities/billiard-table.entity.ts`
- `libs/shared/src/entities/billiard-table-photo.entity.ts`
- `libs/shared/src/entities/booking.entity.ts`

## Repository Usage Pattern

- Services inject raw TypeORM repositories with `@InjectRepository(...)`.
- Examples:
  - `IdentityService` injects `Repository<UserEntity>`
  - `BilliardTablesService` injects table and photo repositories
  - `BookingService` injects `Repository<BookingEntity>`

No custom repository classes were found in codebase.

## Query Patterns

### Identity

- uses `findOne`, `find`, `save`, `remove`
- one query builder is used for simplified users

### Billiard Tables

- table fetches often include `relations: ['photos']`
- photos are saved as separate entities

### Booking

- overlap detection uses:
  - same table
  - non-cancelled/non-rejected statuses
  - time interval intersection
- booked slots query uses `Between`, `In`, `Not`

## Database Constraints Seen In Code / Migrations

- `users.email` unique
- `bookings.userId` foreign key to `users.id`, `ON DELETE SET NULL`
- `bookings.billiardTableId` foreign key to `billiard_tables.id`, `ON DELETE SET NULL`
- `billiard_table_photos.billiard_table_id` foreign key to `billiard_tables.id`, `ON DELETE CASCADE`

Migration sources:

- `apps/migrations/src/migrations/1765838669607-add_user_entity.ts`
- `apps/migrations/src/migrations/1766137336817-add_user_role_and_status.ts`
- `apps/migrations/src/migrations/1766408198463-billiard_tables_init.ts`
- `apps/migrations/src/migrations/1769038040380-change_default_billiard_table_status.ts`
- `apps/migrations/src/migrations/1769059329339-setup_bookings.ts`

## Migrations

- Datasource: `apps/migrations/src/data-source.ts`
- Script wrapper: `scripts/migrations.ts`
- Package scripts:
  - `pnpm migrations:generate <name>`
  - `pnpm migrations:show`
  - `pnpm migrations:run`
  - `pnpm migrations:revert`

Typical flow:

1. Change TypeORM entities in `libs/shared/src/entities/*`.
2. Generate a migration:
   - `pnpm migrations:generate setup_tournaments`
3. Review the generated file in `apps/migrations/src/migrations`.
4. Apply migrations:
   - `pnpm migrations:run`
5. If needed, rollback the last migration:
   - `pnpm migrations:revert`

Notes:

- The generator loads `apps/migrations/src/data-source.ts`, so `.env` must contain every required config group from `libs/shared/src/config/config.validation.ts`.
- Extra TypeORM flags can be passed through the wrapper, for example:
  - `pnpm migrations:generate setup_tournaments --dryrun`

## Non-Postgres Data Stores

### Object storage

- Service: `apps/storage`
- Backend: MinIO via `nestjs-minio`
- Stored objects:
  - user profile photos
  - billiard table photos

### Email transport

- Service: `apps/notification`
- Backend: SMTP transport via `@nestjs-modules/mailer`

## Data Mapping Pattern

- Services map entities to DTOs with `plainToInstance(..., { excludeExtraneousValues: true })`.
- Examples:
  - `IdentityService.mapUserEntityToDto()`
  - `BilliardTablesService.mapTableEntityToDto()`
  - `BookingService.mapEntityToDto()`

## Important Observations

- Table default status differs historically:
  - migration `1766408198463` used `Available`
  - migration `1769038040380` changed it to `Maintenance`
  - current entity also defaults to `Maintenance`

## Example

```text
BookingService.create()
-> use prepared booking context from api-gateway
-> save BookingEntity in PostgreSQL
-> map entity to BookingDto
```

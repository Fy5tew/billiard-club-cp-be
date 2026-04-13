# Setup And Run

## Local Stack

Infrastructure defined in `docker-compose.yaml`:

- `postgres`
- `rabbitmq`
- `minio`
- `maildev`
- `public-proxy`
- application containers:
  - `api-gateway`
  - `identity-service`
  - `billiard-tables-service`
  - `booking-service`
  - `notification-service`
  - `storage-service`
- tooling container:
  - `migrations` with profile `tools`

## Environment Configuration

Runtime config is loaded from `.env` through:

- `libs/shared/src/config/load-config.ts`
- `libs/shared/src/config/config.validation.ts`

Required config groups found in code:

- `DB`
- `MAIL_SERVER`
- `S3`
- `RABBITMQ`
- `JWT`
- `API_GATEWAY`
- `IDENTITY`
- `BILLIARD_TABLES`
- `BOOKING`
- `NOTIFICATION`
- `STORAGE`

Example variable names from `.env`:

- `DB__HOST`
- `DB__PORT`
- `RABBITMQ__HOST`
- `JWT__SECRET`
- `API_GATEWAY__PORT`
- `IDENTITY__RMQ_QUEUE`
- `STORAGE__RMQ_QUEUE`

## Install

```bash
npm install
```

## Run

Available root scripts from `package.json`:

- `npm run build`
- `npm run build:all`
- `npm run start`
- `npm run start:dev`
- `npm run start:debug`

Per-app start scripts are NOT FOUND IN CODEBASE as dedicated npm commands.

## Run Infrastructure With Docker

```bash
docker compose up --build
```

Important orchestration details from `docker-compose.yaml`:

- RabbitMQ is required by all application services.
- Postgres is required by:
  - `identity-service`
  - `billiard-tables-service`
  - `booking-service`
  - `migrations`
- Maildev is required by `notification-service`.
- MinIO is required by `storage-service`.

## Migrations

Root commands:

- `npm run migrations:generate <name>`
- `npm run migrations:show`
- `npm run migrations:run`
- `npm run migrations:revert`

Docker variants also exist:

- `npm run docker:migrations:generate <name>`
- `npm run docker:migrations:show`
- `npm run docker:migrations:run`
- `npm run docker:migrations:revert`

## API Docs

- Swagger UI: `/docs/swagger`
- OpenAPI JSON: `/docs/openapi.json`
- `/` redirects to Swagger via `apps/api-gateway/src/controllers/home.controller.ts`

## Tests

- Jest root config is embedded in `package.json`.
- Commands:
  - `npm test`
  - `npm run test:coverage`

## Notes

- Production deployment process beyond Dockerfiles and compose file is NOT FOUND IN CODEBASE.

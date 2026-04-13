# Error Handling

## Cross-Boundary Error Strategy

The project translates exceptions between HTTP and RabbitMQ instead of duplicating error formatting in each controller.

## Gateway Side

### `RpcClientErrorInterceptor`

- File: `libs/shared/src/helpers/rpc-client-error.interceptor.ts`
- Purpose:
  - intercept failed RMQ client calls
  - unwrap serialized RPC errors
  - rethrow them as `RpcException`

### `RpcToHttpExceptionFilter`

- File: `libs/shared/src/helpers/rpc-to-http-exception.filter.ts`
- Installed in `apps/api-gateway/src/main.ts`
- Purpose:
  - convert `RpcException` into HTTP JSON response

## Microservice Side

### `HttpToRpcExceptionFilter`

- File: `libs/shared/src/helpers/http-to-rpc-exception.filter.ts`
- Installed in every microservice `main.ts`
- Purpose:
  - catch `HttpException`
  - wrap its response payload in `RpcException`

## Validation Errors

- All apps enable `ValidationPipe({ transform: true })`.
- DTO validation errors become:
  - HTTP responses in gateway
  - RPC errors in microservices after the HTTP-to-RPC filter

## Database Error Mapping

- Helper: `libs/shared/src/helpers/catch-database-error.decorator.ts`
- Used to translate TypeORM `QueryFailedError` by SQLSTATE code.

Mapped cases found in code:

- `IdentityService.createEntity()`
  - duplicate email -> `ConflictException`
- `IdentityService.getEntityById()`
  - invalid UUID -> `BadRequestException`
- `BilliardTablesService.createEntity()`
  - duplicate table title -> `ConflictException`
- `BilliardTablesService.getEntityById()`
  - invalid UUID -> `BadRequestException`

## Business Errors Thrown Directly

- Identity:
  - invalid credentials
  - blocked user
  - user not found
- Billiard tables:
  - table not found
- Booking:
  - start time in past
  - invalid time range
  - overlapping booking
  - invalid status transition
  - booking not found
- Gateway-only:
  - missing multipart file
  - booking ownership violation
  - invalid activation token type

## Gaps / Limits

- Structured app-specific error codes beyond HTTP status/message are NOT FOUND IN CODEBASE.
- RMQ retries/dead-letter handling are NOT FOUND IN CODEBASE.

## Example

```text
Microservice throws BadRequestException
-> HttpToRpcExceptionFilter wraps to RpcException
-> gateway client call fails
-> RpcClientErrorInterceptor unwraps it
-> RpcToHttpExceptionFilter returns HTTP 400 JSON
```

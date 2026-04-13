# Request Flow

## Example 1: Create Booking

1. HTTP request hits `POST /bookings` in `apps/api-gateway/src/controllers/bookings.controller.ts`.
2. `JwtAccessAuthGuard` authenticates the bearer token.
3. Controller reads `request.user.id`.
4. Controller calls `BookingClient.create(user.id, data)`.
5. `BookingClient` sends `BookingMessage.CREATE` over RabbitMQ.
6. `apps/booking/src/booking.controller.ts` receives the message.
7. `BookingService.create()`:
   - validates time range
   - loads table from `billiard-tables`
   - loads user from `identity`
   - checks overlap in PostgreSQL
   - computes `totalCost`
   - saves `BookingEntity`
8. Service maps entity to `BookingDto`.
9. Gateway returns JSON response.

## Example 2: Upload User Photo

1. HTTP request hits `POST /users/current/photo`.
2. `FileInterceptor('file')` parses multipart upload.
3. `UsersController.updateCurrentPhoto()` converts file to `{ filename, buffer, mimeType }`.
4. Controller calls `IdentityClient.updatePhotoById(...)`.
5. `IdentityService.updateEntityPhotoById()`:
   - generates new UUID-based filename
   - computes storage path with `getUserProfilePhotoPath()`
   - calls `StorageClient.uploadFile(...)`
   - updates `photoFilename` in `UserEntity`
6. `mapUserEntityToDto()` asks storage for a presigned URL.
7. Gateway returns `UserDto` with `photoUrl`.

## Example 3: Activation

1. `POST /auth/register` creates pending user.
2. `IdentityService.create()` triggers `sendActivationEmail()`.
3. `NotificationClient.sendEmail()` emits `send_email`.
4. User receives activation link.
5. `POST /auth/activate` decodes token and calls `IdentityClient.activate()`.
6. `IdentityService.activate()` sets status to `Active`.

## Error Path

1. Microservice throws `BadRequestException`, `ConflictException`, or similar.
2. `HttpToRpcExceptionFilter` converts it to `RpcException`.
3. Gateway client call fails.
4. `RpcClientErrorInterceptor` unwraps serialized RPC error.
5. `RpcToHttpExceptionFilter` returns HTTP JSON.

## Notes

- Request-scoped tracing or correlation IDs are NOT FOUND IN CODEBASE.

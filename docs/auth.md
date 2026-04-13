# Authentication And Authorization

## Auth Components

- Gateway auth code:
  - `apps/api-gateway/src/auth/auth.decorators.ts`
  - `apps/api-gateway/src/auth/jwt-access.guard.ts`
  - `apps/api-gateway/src/auth/jwt-access.strategy.ts`
  - `apps/api-gateway/src/auth/jwt-refresh.guard.ts`
  - `apps/api-gateway/src/auth/jwt-refresh.strategy.ts`
  - `apps/api-gateway/src/auth/role-access.guard.ts`
- Identity token creation:
  - `apps/identity/src/identity.service.ts`
- Shared token types:
  - `libs/shared/src/types/auth.types.ts`

## Token Types

- `ACCESS`
  - payload: `{ tokenType: ACCESS, user: UserDto }`
- `REFRESH`
  - payload: `{ tokenType: REFRESH, userId }`
- `ACTIVATION`
  - payload: `{ tokenType: ACTIVATION, userId }`

## Login Flow

1. `POST /auth/login` enters `AuthController.login()`.
2. Gateway calls `IdentityClient.login()`.
3. `IdentityService.login()`:
   - loads user by email
   - compares bcrypt password
   - rejects `Pending`
   - rejects `Blocked`
   - generates access + refresh JWTs
4. Gateway returns access token in JSON and sets refresh token cookie.

## Refresh Flow

1. `GET /auth/refresh` uses `JwtRefreshGuard`.
2. `JwtRefreshStrategy` extracts token from cookie `refresh_token`.
3. Strategy verifies `tokenType === REFRESH`.
4. Gateway calls `IdentityClient.refresh(userId)`.
5. Identity service issues a new token pair.

## Activation Flow

1. Registration calls `IdentityService.create()`.
2. Identity service saves user and asynchronously triggers `sendActivationEmail()`.
3. Activation email contains URL from `IDENTITY.ACTIVATION_URL`.
4. `POST /auth/activate` decodes activation token and calls `IdentityClient.activate(userId)`.
5. Identity service switches status from `Pending` to `Active`.

## Access Guard

- `JwtAccessAuthGuard` is installed globally in `apps/api-gateway/src/main.ts`.
- Public routes bypass it using `@PublicRoute()`.
- `JwtAccessStrategy`:
  - extracts bearer token from `Authorization`
  - verifies JWT with `config.JWT.SECRET`
  - validates `tokenType === ACCESS`
  - rejects users whose embedded status is not `Active`

## Refresh Guard

- `JwtRefreshGuard` wraps `JwtRefreshStrategy`.
- Refresh token is read from cookie, not header.

## Cookie Configuration

- Defined in `apps/api-gateway/src/constants/auth.constants.ts`
- Current options:
  - `httpOnly: true`
  - `sameSite: 'strict'`
  - `path: '/'`
- `secure: true` is commented out with TODO for HTTPS setup.

## Role Authorization

- Role metadata is attached with `@RoleAccess(UserRole.X)`.
- `RoleAccessGuard` compares `request.user.role >= requiredRole`.
- `UserRole` enum order is:
  - `User = 0`
  - `Manager = 1`
  - `Admin = 2`

## Important Limitation

- `RoleAccessGuard` exists in code, but I did not find it registered:
  - not in `apps/api-gateway/src/main.ts`
  - not in `apps/api-gateway/src/api-gateway.module.ts`
  - no `APP_GUARD` binding found
- Runtime role enforcement wiring is therefore NOT FOUND IN CODEBASE.

## Config Inputs

- JWT config is validated in `libs/shared/src/config/config.validation.ts`
- Required fields:
  - `JWT.SECRET`
  - `JWT.ACCESS_EXPIRES`
  - `JWT.REFRESH_EXPIRES`
  - `JWT.ACTIVATION_EXPIRES`

## Example

```text
Bearer access token
-> JwtAccessStrategy
-> payload.user becomes request.user
-> controllers use request.user.id and request.user.role
```

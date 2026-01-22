import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@app/shared/config/config.module';
import { registerClient } from '@app/shared/helpers/register-client.util';
import { registerJwt } from '@app/shared/helpers/register-jwt.util';
import { BilliardTablesClient } from '@app/shared/services/billiard-tables/billiard-tables.client';
import { BookingClient } from '@app/shared/services/booking/booking.client';
import { IdentityClient } from '@app/shared/services/identity/identity.client';
import { Service } from '@app/shared/services/services.types';

import { JwtAccessStrategy } from './auth/jwt-access.strategy';
import { JwtRefreshStrategy } from './auth/jwt-refresh.strategy';
import { AuthController } from './controllers/auth.controller';
import { BilliardTablesController } from './controllers/billiard-tables.controller';
import { BookingsController } from './controllers/bookings.controller';
import { HomeController } from './controllers/home.controller';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    registerJwt(),
    registerClient(Service.IDENTITY),
    registerClient(Service.BILLIARD_TABLES),
    registerClient(Service.BOOKING),
  ],
  controllers: [
    HomeController,
    AuthController,
    UsersController,
    BilliardTablesController,
    BookingsController,
  ],
  providers: [
    IdentityClient,
    BilliardTablesClient,
    BookingClient,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class ApiGatewayModule {}

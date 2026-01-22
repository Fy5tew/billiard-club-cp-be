import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@app/shared/config/config.module';
import { registerClient } from '@app/shared/helpers/register-client.util';
import { registerJwt } from '@app/shared/helpers/register-jwt.util';
import { BilliardTablesClient } from '@app/shared/services/billiard-tables/billiard-tables.client';
import { IdentityClient } from '@app/shared/services/identity/identity.client';
import { Service } from '@app/shared/services/services.types';

import { JwtAccessStrategy } from './auth/jwt-access.strategy';
import { JwtRefreshStrategy } from './auth/jwt-refresh.strategy';
import { AuthController } from './controllers/auth.controller';
import { BilliardTablesController } from './controllers/billiard-tables.controller';
import { HomeController } from './controllers/home.controller';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    registerJwt(),
    registerClient(Service.IDENTITY),
    registerClient(Service.BILLIARD_TABLES),
  ],
  controllers: [
    HomeController,
    AuthController,
    UsersController,
    BilliardTablesController,
  ],
  providers: [
    IdentityClient,
    BilliardTablesClient,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class ApiGatewayModule {}

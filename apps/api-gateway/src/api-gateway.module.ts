import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@app/shared/config/config.module';
import { registerClient } from '@app/shared/helpers/register-client.util';
import { BilliardTablesClient } from '@app/shared/services/billiard-tables/billiard-tables.client';
import { IdentityClient } from '@app/shared/services/identity/identity.client';
import { Service } from '@app/shared/services/services.types';
import { StorageClient } from '@app/shared/services/storage/storage.client';

import { JwtAccessStrategy } from './auth/jwt-access.strategy';
import { JwtRefreshStrategy } from './auth/jwt-refresh.strategy';
import { AuthController } from './controllers/auth.controller';
import { HomeController } from './controllers/home.controller';
import { StorageController } from './controllers/storage.controller';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    registerClient(Service.IDENTITY),
    registerClient(Service.BILLIARD_TABLES),
    registerClient(Service.STORAGE),
  ],
  controllers: [
    HomeController,
    AuthController,
    UsersController,
    StorageController,
  ],
  providers: [
    IdentityClient,
    BilliardTablesClient,
    StorageClient,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class ApiGatewayModule {}

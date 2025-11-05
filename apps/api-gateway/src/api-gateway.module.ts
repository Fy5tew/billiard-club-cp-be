import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { IdentityClient } from '@app/shared/clients/identity.client';
import { ConfigModule } from '@app/shared/config/config.module';
import { Service } from '@app/shared/types/service.types';
import { registerClient } from '@app/shared/utils/register-client.util';

import { JwtAccessStrategy } from './auth/jwt-access.strategy';
import { JwtRefreshStrategy } from './auth/jwt-refresh.strategy';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [PassportModule, ConfigModule, registerClient(Service.IDENTITY)],
  controllers: [AuthController, UsersController],
  providers: [IdentityClient, JwtAccessStrategy, JwtRefreshStrategy],
})
export class ApiGatewayModule {}

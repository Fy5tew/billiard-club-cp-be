import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { IdentityClient } from '@app/shared/clients/identity.client';
import { ConfigModule } from '@app/shared/config/config.module';
import { Service } from '@app/shared/types/service.types';
import { registerClient } from '@app/shared/utils/register-client.util';

import { ApiGatewayController } from './api-gateway.controller';
import { JwtAccessStrategy } from './auth/jwt-access.strategy';
import { JwtRefreshStrategy } from './auth/jwt-refresh.strategy';

@Module({
  imports: [PassportModule, ConfigModule, registerClient(Service.IDENTITY)],
  controllers: [ApiGatewayController],
  providers: [IdentityClient, JwtAccessStrategy, JwtRefreshStrategy],
})
export class ApiGatewayModule {}

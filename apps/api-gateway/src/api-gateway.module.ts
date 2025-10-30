import { Module } from '@nestjs/common';

import { IdentityClient } from '@app/shared/clients/identity.client';
import { ConfigModule } from '@app/shared/config/config.module';
import { Service } from '@app/shared/constants/service.constants';
import { registerClient } from '@app/shared/utils/register-client.util';

import { ApiGatewayController } from './api-gateway.controller';

@Module({
  imports: [ConfigModule, registerClient(Service.IDENTITY)],
  controllers: [ApiGatewayController],
  providers: [IdentityClient],
})
export class ApiGatewayModule {}

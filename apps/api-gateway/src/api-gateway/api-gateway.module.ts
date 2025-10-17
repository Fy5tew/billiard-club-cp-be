import { Module } from '@nestjs/common';

import {
  ConfigModule,
  IdentityClient,
  registerClient,
  Service,
} from '@app/shared';

import { ApiGatewayController } from './api-gateway.controller';

@Module({
  imports: [ConfigModule, registerClient(Service.IDENTITY)],
  controllers: [ApiGatewayController],
  providers: [IdentityClient],
})
export class ApiGatewayModule {}

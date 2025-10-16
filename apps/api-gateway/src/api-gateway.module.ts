import { Module } from '@nestjs/common';

import {
  ConfigModule,
  IdentityClient,
  registerClient,
  Service,
} from '@app/shared';

import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';

@Module({
  imports: [ConfigModule, registerClient(Service.IDENTITY)],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService, IdentityClient],
})
export class ApiGatewayModule {}

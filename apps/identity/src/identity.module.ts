import { Module } from '@nestjs/common';

import { ConfigModule } from '@app/shared';

import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [ConfigModule],
  controllers: [IdentityController],
  providers: [IdentityService],
})
export class IdentityModule {}

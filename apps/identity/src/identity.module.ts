import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationClient } from '@app/shared/clients/notification.client';
import { ConfigModule } from '@app/shared/config/config.module';
import { UserEntity } from '@app/shared/entities/user.entity';
import { Service } from '@app/shared/types/service.types';
import { registerClient } from '@app/shared/utils/register-client.util';
import { registerDatabase } from '@app/shared/utils/register-database.util';
import { registerJwt } from '@app/shared/utils/register-jwt.util';

import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    ConfigModule,
    registerJwt(),
    registerDatabase(),
    TypeOrmModule.forFeature([UserEntity]),
    registerClient(Service.NOTIFICATION),
  ],
  providers: [IdentityService, NotificationClient],
  controllers: [IdentityController],
})
export class IdentityModule {}

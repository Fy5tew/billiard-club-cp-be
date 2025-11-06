import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/shared/config/config.module';
import { UserEntity } from '@app/shared/entities/user.entity';
import { registerClient } from '@app/shared/helpers/register-client.util';
import { registerDatabase } from '@app/shared/helpers/register-database.util';
import { registerJwt } from '@app/shared/helpers/register-jwt.util';
import { NotificationClient } from '@app/shared/services/notification/notification.client';
import { Service } from '@app/shared/services/services.types';

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

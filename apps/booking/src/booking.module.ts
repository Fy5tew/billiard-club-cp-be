import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/shared/config/config.module';
import { BilliardTablePhotoEntity } from '@app/shared/entities/billiard-table-photo.entity';
import { BilliardTableEntity } from '@app/shared/entities/billiard-table.entity';
import { BookingEntity } from '@app/shared/entities/booking.entity';
import { UserEntity } from '@app/shared/entities/user.entity';
import { registerClient } from '@app/shared/helpers/register-client.util';
import { registerDatabase } from '@app/shared/helpers/register-database.util';
import { BilliardTablesClient } from '@app/shared/services/billiard-tables/billiard-tables.client';
import { IdentityClient } from '@app/shared/services/identity/identity.client';
import { Service } from '@app/shared/services/services.types';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    ConfigModule,
    registerDatabase(),
    TypeOrmModule.forFeature([
      // TODO: No need this entities
      UserEntity,
      BilliardTableEntity,
      BilliardTablePhotoEntity,
      BookingEntity,
    ]),
    registerClient(Service.IDENTITY),
    registerClient(Service.BILLIARD_TABLES),
  ],
  providers: [BookingService, IdentityClient, BilliardTablesClient],
  controllers: [BookingController],
})
export class BookingModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/shared/config/config.module';
import { BilliardTablePhotoEntity } from '@app/shared/entities/billiard-table-photo.entity';
import { BilliardTableEntity } from '@app/shared/entities/billiard-table.entity';
import { BookingEntity } from '@app/shared/entities/booking.entity';
import { UserEntity } from '@app/shared/entities/user.entity';
import { registerDatabase } from '@app/shared/helpers/register-database.util';

import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [
    ConfigModule,
    registerDatabase(),
    TypeOrmModule.forFeature([
      BookingEntity,
      BilliardTableEntity,
      BilliardTablePhotoEntity,
      UserEntity,
    ]),
  ],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}

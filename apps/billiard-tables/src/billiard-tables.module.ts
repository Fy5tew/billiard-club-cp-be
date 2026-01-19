import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/shared/config/config.module';
import { BilliardTablePhotoEntity } from '@app/shared/entities/billiard-table-photo.entity';
import { BilliardTableEntity } from '@app/shared/entities/billiard-table.entity';
import { registerClient } from '@app/shared/helpers/register-client.util';
import { registerDatabase } from '@app/shared/helpers/register-database.util';
import { Service } from '@app/shared/services/services.types';
import { StorageClient } from '@app/shared/services/storage/storage.client';

import { BilliardTablesController } from './billiard-tables.controller';
import { BilliardTablesService } from './billiard-tables.service';

@Module({
  imports: [
    ConfigModule,
    registerDatabase(),
    TypeOrmModule.forFeature([BilliardTableEntity, BilliardTablePhotoEntity]),
    registerClient(Service.STORAGE),
  ],
  providers: [BilliardTablesService, StorageClient],
  controllers: [BilliardTablesController],
})
export class BilliardTablesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/shared/config/config.module';
import { NewsEntity } from '@app/shared/entities/news.entity';
import { registerClient } from '@app/shared/helpers/register-client.util';
import { registerDatabase } from '@app/shared/helpers/register-database.util';
import { Service } from '@app/shared/services/services.types';
import { StorageClient } from '@app/shared/services/storage/storage.client';

import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [
    ConfigModule,
    registerDatabase(),
    TypeOrmModule.forFeature([NewsEntity]),
    registerClient(Service.STORAGE),
  ],
  providers: [NewsService, StorageClient],
  controllers: [NewsController],
})
export class NewsModule {}

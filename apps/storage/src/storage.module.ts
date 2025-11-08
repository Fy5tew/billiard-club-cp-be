import { Module } from '@nestjs/common';
import { NestMinioModule } from 'nestjs-minio';

import { ConfigModule } from '@app/shared/config/config.module';
import { ConfigService } from '@app/shared/config/config.service';

import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [
    ConfigModule,
    NestMinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const {
          ENDPOINT,
          PORT,
          ACCESS_KEY_ID,
          SECRET_ACCESS_KEY,
          REGION,
          SECURE,
        } = config.S3;

        return {
          endPoint: ENDPOINT,
          port: PORT,
          accessKey: ACCESS_KEY_ID,
          secretKey: SECRET_ACCESS_KEY,
          region: REGION,
          useSSL: SECURE,
        };
      },
    }),
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}

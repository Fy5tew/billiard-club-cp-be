import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { loadConfig } from '@app/shared/config/load-config';
import { BilliardTablePhotoEntity } from '@app/shared/entities/billiard-table-photo.entity';
import { BilliardTableEntity } from '@app/shared/entities/billiard-table.entity';
import { BookingEntity } from '@app/shared/entities/booking.entity';
import { UserEntity } from '@app/shared/entities/user.entity';

const config = loadConfig().DB;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.HOST,
  port: config.PORT,
  username: config.USER,
  password: config.PASSWORD,
  database: config.NAME,
  entities: [
    UserEntity,
    BilliardTableEntity,
    BilliardTablePhotoEntity,
    BookingEntity,
  ],
  migrations: ['apps/migrations/src/migrations/*.ts'],
});

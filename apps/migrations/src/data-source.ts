import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { loadConfig } from '@app/shared/config/load-config';
import { BilliardTablePhotoEntity } from '@app/shared/entities/billiard-table-photo.entity';
import { BilliardTableEntity } from '@app/shared/entities/billiard-table.entity';
import { BookingEntity } from '@app/shared/entities/booking.entity';
import { NewsEntity } from '@app/shared/entities/news.entity';
import { TournamentBracketEntity } from '@app/shared/entities/tournament-bracket.entity';
import { TournamentMatchEntity } from '@app/shared/entities/tournament-match.entity';
import { TournamentRegistrationEntity } from '@app/shared/entities/tournament-registration.entity';
import { TournamentEntity } from '@app/shared/entities/tournament.entity';
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
    TournamentEntity,
    TournamentRegistrationEntity,
    TournamentBracketEntity,
    TournamentMatchEntity,
    NewsEntity,
  ],
  migrations: ['apps/migrations/src/migrations/*.ts'],
});

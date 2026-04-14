import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@app/shared/config/config.module';
import { TournamentRegistrationEntity } from '@app/shared/entities/tournament-registration.entity';
import { TournamentEntity } from '@app/shared/entities/tournament.entity';
import { registerDatabase } from '@app/shared/helpers/register-database.util';

import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
  imports: [
    ConfigModule,
    registerDatabase(),
    TypeOrmModule.forFeature([TournamentEntity, TournamentRegistrationEntity]),
  ],
  providers: [TournamentsService],
  controllers: [TournamentsController],
})
export class TournamentsModule {}

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TournamentEntity } from './tournament.entity';
import { TournamentRegistrationStatus } from '../dtos/tournament-registration.dto';
import type { TournamentId } from '../dtos/tournament.dto';
import type { UserId } from '../dtos/user.dto';

@Entity('tournament_registrations')
export class TournamentRegistrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  tournamentId: TournamentId;

  @ManyToOne(() => TournamentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournamentId' })
  _tournament?: TournamentEntity;

  @Index()
  @Column({ type: 'uuid' })
  userId: UserId;

  @Column({
    type: 'enum',
    enum: TournamentRegistrationStatus,
    default: TournamentRegistrationStatus.Pending,
  })
  status: TournamentRegistrationStatus;
}

import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TournamentRegistrationEntity } from './tournament-registration.entity';
import { TournamentStatus } from '../dtos/tournament.dto';

@Entity('tournaments')
export class TournamentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ type: 'timestamp' })
  startAt: Date;

  @Column({ type: 'timestamp' })
  endAt: Date;

  @Column({ type: 'timestamp' })
  registrationDeadline: Date;

  @Column({ type: 'int' })
  maxParticipants: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  entryFee: number;

  @Index()
  @Column({
    type: 'enum',
    enum: TournamentStatus,
    default: TournamentStatus.Draft,
  })
  status: TournamentStatus;

  @Column({ type: 'varchar', nullable: true })
  format: string | null;

  @Column({ type: 'text', nullable: true })
  rules: string | null;

  @Column({ type: 'text', nullable: true })
  prizeDescription: string | null;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @OneToMany(
    () => TournamentRegistrationEntity,
    (registration) => registration._tournament,
  )
  registrations?: TournamentRegistrationEntity[];
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TournamentBracketEntity } from './tournament-bracket.entity';
import { TournamentEntity } from './tournament.entity';
import {
  TournamentMatchSlot,
  TournamentMatchStatus,
  TournamentMatchWinReason,
  type TournamentBracketId,
  type TournamentMatchId,
} from '../dtos/tournament-bracket.dto';
import type { TournamentId } from '../dtos/tournament.dto';
import type { UserId } from '../dtos/user.dto';

@Index('IDX_tournament_matches_tournament_id', ['tournamentId'])
@Index('IDX_tournament_matches_bracket_id', ['bracketId'])
@Index(
  'IDX_tournament_matches_bracket_round_match_unique',
  ['bracketId', 'roundIndex', 'matchIndex'],
  { unique: true },
)
@Index('IDX_tournament_matches_winner_user_id', ['winnerUserId'])
@Index('IDX_tournament_matches_participant_a_user_id', ['participantAUserId'])
@Index('IDX_tournament_matches_participant_b_user_id', ['participantBUserId'])
@Entity('tournament_matches')
export class TournamentMatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: TournamentMatchId;

  @Column({ type: 'uuid' })
  tournamentId: TournamentId;

  @ManyToOne(() => TournamentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournamentId' })
  _tournament?: TournamentEntity;

  @Column({ type: 'uuid' })
  bracketId: TournamentBracketId;

  @ManyToOne(() => TournamentBracketEntity, (bracket) => bracket.matches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bracketId' })
  _bracket?: TournamentBracketEntity;

  @Column({ type: 'int' })
  roundIndex: number;

  @Column({ type: 'int' })
  matchIndex: number;

  @Column({ type: 'uuid', nullable: true })
  participantAUserId: UserId | null;

  @Column({ type: 'uuid', nullable: true })
  participantBUserId: UserId | null;

  @Column({ type: 'int', nullable: true })
  scoreA: number | null;

  @Column({ type: 'int', nullable: true })
  scoreB: number | null;

  @Column({ type: 'uuid', nullable: true })
  winnerUserId: UserId | null;

  @Column({ type: 'uuid', nullable: true })
  loserUserId: UserId | null;

  @Column({
    type: 'enum',
    enum: TournamentMatchStatus,
    default: TournamentMatchStatus.Pending,
  })
  status: TournamentMatchStatus;

  @Column({
    type: 'enum',
    enum: TournamentMatchWinReason,
    nullable: true,
  })
  winReason: TournamentMatchWinReason | null;

  @Column({ type: 'uuid', nullable: true })
  nextMatchId: TournamentMatchId | null;

  @ManyToOne(() => TournamentMatchEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'nextMatchId' })
  _nextMatch?: TournamentMatchEntity | null;

  @Column({
    type: 'enum',
    enum: TournamentMatchSlot,
    nullable: true,
  })
  nextSlot: TournamentMatchSlot | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

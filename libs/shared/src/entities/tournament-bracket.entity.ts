import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TournamentMatchEntity } from './tournament-match.entity';
import { TournamentEntity } from './tournament.entity';
import {
  TournamentBracketStatus,
  type TournamentBracketId,
} from '../dtos/tournament-bracket.dto';
import type { TournamentId } from '../dtos/tournament.dto';

@Index('IDX_tournament_brackets_tournament_id_unique', ['tournamentId'], {
  unique: true,
})
@Entity('tournament_brackets')
export class TournamentBracketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: TournamentBracketId;

  @Column({ type: 'uuid' })
  tournamentId: TournamentId;

  @ManyToOne(() => TournamentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournamentId' })
  _tournament?: TournamentEntity;

  @Column({ type: 'int' })
  size: number;

  @Index()
  @Column({
    type: 'enum',
    enum: TournamentBracketStatus,
    default: TournamentBracketStatus.Seeding,
  })
  status: TournamentBracketStatus;

  @OneToMany(() => TournamentMatchEntity, (match) => match._bracket)
  matches?: TournamentMatchEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

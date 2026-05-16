import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import type { TournamentId } from './tournament.dto';
import { SimplifiedUserDto, type UserId } from './user.dto';

export type TournamentBracketId = string;
export type TournamentMatchId = string;

export enum TournamentBracketStatus {
  Seeding = 'Seeding',
  Active = 'Active',
  Completed = 'Completed',
}

export enum TournamentMatchStatus {
  Pending = 'Pending',
  Ready = 'Ready',
  Completed = 'Completed',
}

export enum TournamentMatchWinReason {
  Normal = 'Normal',
  Bye = 'Bye',
  Technical = 'Technical',
}

export enum TournamentMatchSlot {
  A = 'A',
  B = 'B',
}

export class TournamentMatchDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020' })
  @Expose()
  @IsUUID()
  id: TournamentMatchId;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  @Min(1)
  roundIndex: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  @Min(1)
  matchIndex: number;

  @ApiProperty({ type: 'string', nullable: true })
  @Expose()
  @IsOptional()
  @IsUUID()
  participantAUserId: UserId | null;

  @ApiProperty({ type: 'string', nullable: true })
  @Expose()
  @IsOptional()
  @IsUUID()
  participantBUserId: UserId | null;

  @ApiPropertyOptional({ type: () => SimplifiedUserDto, nullable: true })
  @Expose()
  @ValidateNested()
  @Type(() => SimplifiedUserDto)
  participantA?: SimplifiedUserDto | null;

  @ApiPropertyOptional({ type: () => SimplifiedUserDto, nullable: true })
  @Expose()
  @ValidateNested()
  @Type(() => SimplifiedUserDto)
  participantB?: SimplifiedUserDto | null;

  @ApiProperty({ type: 'number', nullable: true })
  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  scoreA: number | null;

  @ApiProperty({ type: 'number', nullable: true })
  @Expose()
  @IsOptional()
  @IsInt()
  @Min(0)
  scoreB: number | null;

  @ApiProperty({ type: 'string', nullable: true })
  @Expose()
  @IsOptional()
  @IsUUID()
  winnerUserId: UserId | null;

  @ApiProperty({ type: 'string', nullable: true })
  @Expose()
  @IsOptional()
  @IsUUID()
  loserUserId: UserId | null;

  @ApiProperty({ enum: TournamentMatchStatus })
  @Expose()
  @IsEnum(TournamentMatchStatus)
  status: TournamentMatchStatus;

  @ApiProperty({ enum: TournamentMatchWinReason, nullable: true })
  @Expose()
  @IsOptional()
  @IsEnum(TournamentMatchWinReason)
  winReason: TournamentMatchWinReason | null;

  @ApiPropertyOptional({ type: 'string', nullable: true })
  @Expose()
  @IsOptional()
  @IsUUID()
  nextMatchId?: TournamentMatchId | null;

  @ApiPropertyOptional({ enum: TournamentMatchSlot, nullable: true })
  @Expose()
  @IsOptional()
  @IsEnum(TournamentMatchSlot)
  nextSlot?: TournamentMatchSlot | null;
}

export class TournamentBracketRoundDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  @Min(1)
  roundIndex: number;

  @ApiProperty({ type: () => [TournamentMatchDto] })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TournamentMatchDto)
  matches: TournamentMatchDto[];
}

export class TournamentBracketDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440030' })
  @Expose()
  @IsUUID()
  id: TournamentBracketId;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  @IsUUID()
  tournamentId: TournamentId;

  @ApiProperty({ example: 8 })
  @Expose()
  @IsInt()
  @Min(2)
  size: number;

  @ApiProperty({ enum: TournamentBracketStatus })
  @Expose()
  @IsEnum(TournamentBracketStatus)
  status: TournamentBracketStatus;

  @ApiProperty({ type: () => [TournamentBracketRoundDto] })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => TournamentBracketRoundDto)
  rounds: TournamentBracketRoundDto[];
}

export class TournamentBracketSeedingSlotDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020' })
  @Expose()
  @IsUUID()
  matchId: TournamentMatchId;

  @ApiProperty({ enum: TournamentMatchSlot })
  @Expose()
  @IsEnum(TournamentMatchSlot)
  slot: TournamentMatchSlot;

  @ApiProperty({ type: 'string', nullable: true })
  @Expose()
  @IsOptional()
  @IsUUID()
  userId: UserId | null;
}

export class UpdateTournamentBracketSeedingDto {
  @ApiProperty({ type: () => [TournamentBracketSeedingSlotDto] })
  @Expose()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TournamentBracketSeedingSlotDto)
  slots: TournamentBracketSeedingSlotDto[];
}

export class SetTournamentMatchResultDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Expose()
  @IsUUID()
  winnerUserId: UserId;

  @ApiProperty({ example: 3 })
  @Expose()
  @IsInt()
  @Min(0)
  scoreA: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  @Min(0)
  scoreB: number;

  @ApiPropertyOptional({
    enum: [TournamentMatchWinReason.Normal, TournamentMatchWinReason.Technical],
  })
  @Expose()
  @IsOptional()
  @IsEnum(TournamentMatchWinReason)
  winReason?:
    | TournamentMatchWinReason.Normal
    | TournamentMatchWinReason.Technical;
}

export class TournamentLeaderboardItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Expose()
  @IsUUID()
  userId: UserId;

  @ApiPropertyOptional({ type: () => SimplifiedUserDto, nullable: true })
  @Expose()
  @ValidateNested()
  @Type(() => SimplifiedUserDto)
  user?: SimplifiedUserDto | null;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  @Min(1)
  place: number;

  @ApiProperty({ example: 3 })
  @Expose()
  @IsInt()
  @Min(0)
  matchesPlayed: number;

  @ApiProperty({ example: 3 })
  @Expose()
  @IsInt()
  @Min(0)
  wins: number;

  @ApiProperty({ example: 0 })
  @Expose()
  @IsInt()
  @Min(0)
  losses: number;

  @ApiProperty({ example: 12 })
  @Expose()
  @IsInt()
  @Min(0)
  scoreFor: number;

  @ApiProperty({ example: 7 })
  @Expose()
  @IsInt()
  @Min(0)
  scoreAgainst: number;

  @ApiProperty({ example: 5 })
  @Expose()
  @IsInt()
  scoreDiff: number;
}

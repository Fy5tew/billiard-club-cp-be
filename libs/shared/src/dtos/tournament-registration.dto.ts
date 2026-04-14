import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsUUID } from 'class-validator';

import type { TournamentId } from './tournament.dto';
import type { UserId } from './user.dto';

export type TournamentRegistrationId = string;

export enum TournamentRegistrationStatus {
  Pending,
  Approved,
  Rejected,
  Cancelled,
  Attended,
  NoShow,
}

export class TournamentRegistrationDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  @Expose()
  @IsUUID()
  id: TournamentRegistrationId;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  @IsUUID()
  tournamentId: TournamentId;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Expose()
  @IsUUID()
  userId: UserId;

  @ApiProperty({
    enum: TournamentRegistrationStatus,
    enumName: 'TournamentRegistrationStatus',
  })
  @Expose()
  @IsEnum(TournamentRegistrationStatus)
  status: TournamentRegistrationStatus;
}

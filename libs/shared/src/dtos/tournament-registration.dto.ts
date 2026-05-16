import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsUUID, ValidateNested } from 'class-validator';

import { TournamentDto, type TournamentId } from './tournament.dto';
import { UserDto, type UserId } from './user.dto';

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

  @ApiProperty({ example: '2026-04-15T10:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: 8 })
  @Expose()
  @IsInt()
  approvedRegistrationsCount: number;
}

export class TournamentRegistrationFullDto extends TournamentRegistrationDto {
  @ApiProperty({ type: () => UserDto, nullable: true })
  @Expose()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto | null;

  @ApiProperty({ type: () => TournamentDto, nullable: true })
  @Expose()
  @ValidateNested()
  @Type(() => TournamentDto)
  tournament: TournamentDto | null;
}

export class CreateTournamentRegistrationManualDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Expose()
  @IsUUID()
  userId: UserId;
}

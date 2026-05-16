import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsEnum, IsUUID, ValidateNested } from 'class-validator';

import { TournamentRegistrationStatus } from './tournament-registration.dto';
import type { TournamentRegistrationId } from './tournament-registration.dto';
import type { TournamentId } from './tournament.dto';
import { SimplifiedUserDto, type UserId } from './user.dto';

export class TournamentParticipantDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  @Expose()
  @IsUUID()
  registrationId: TournamentRegistrationId;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  @IsUUID()
  tournamentId: TournamentId;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Expose()
  @IsUUID()
  userId: UserId;

  @ApiPropertyOptional({ type: () => SimplifiedUserDto, nullable: true })
  @Expose()
  @ValidateNested()
  @Type(() => SimplifiedUserDto)
  user?: SimplifiedUserDto | null;

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
}

export class UpdateTournamentParticipantAttendanceDto {
  @ApiProperty({
    enum: [
      TournamentRegistrationStatus.Approved,
      TournamentRegistrationStatus.Attended,
      TournamentRegistrationStatus.NoShow,
    ],
    example: TournamentRegistrationStatus.Attended,
    examples: {
      approved: {
        value: TournamentRegistrationStatus.Approved,
      },
      attended: {
        value: TournamentRegistrationStatus.Attended,
      },
      noShow: {
        value: TournamentRegistrationStatus.NoShow,
      },
    },
  })
  @Expose()
  @IsEnum(
    [
      TournamentRegistrationStatus.Approved,
      TournamentRegistrationStatus.Attended,
      TournamentRegistrationStatus.NoShow,
    ] as const,
    {
      message:
        'status must be one of: Approved, Attended, NoShow attendance enum values',
    },
  )
  status: TournamentRegistrationStatus;
}

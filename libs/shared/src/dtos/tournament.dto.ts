import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export type TournamentId = string;

export enum TournamentStatus {
  Draft,
  Published,
  RegistrationClosed,
  InProgress,
  Completed,
  Cancelled,
}

export class TournamentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  @IsUUID()
  id: TournamentId;

  @ApiProperty({ example: 'Spring Pool Cup' })
  @Expose()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Open amateur tournament for club members',
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsString()
  description: string | null;

  @ApiProperty({ example: '2026-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  startAt: Date;

  @ApiProperty({ example: '2026-05-20T20:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  endAt: Date;

  @ApiProperty({ example: '2026-05-18T23:59:59Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  registrationDeadline: Date;

  @ApiProperty({ example: 16 })
  @Expose()
  @IsInt()
  @Min(1)
  maxParticipants: number;

  @ApiProperty({ example: 50 })
  @Expose()
  @IsNumber()
  @Min(0)
  entryFee: number;

  @ApiProperty({ enum: TournamentStatus, enumName: 'TournamentStatus' })
  @Expose()
  @IsEnum(TournamentStatus)
  status: TournamentStatus;

  @ApiProperty({ example: 'Single Elimination', nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  format: string | null;

  @ApiProperty({ example: 'Race to 5, standard WPA rules', nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  rules: string | null;

  @ApiProperty({ example: 'Winner gets 70% of the prize pool', nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  prizeDescription: string | null;

  @ApiProperty({
    example: '2026-05-01T10:00:00Z',
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  publishedAt: Date | null;
}

export class CreateTournamentDto {
  @ApiProperty({ example: 'Spring Pool Cup' })
  @Expose()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Open amateur tournament for club members',
    required: false,
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: '2026-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  startAt: Date;

  @ApiProperty({ example: '2026-05-20T20:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  endAt: Date;

  @ApiProperty({ example: '2026-05-18T23:59:59Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  registrationDeadline: Date;

  @ApiProperty({ example: 16 })
  @Expose()
  @IsInt()
  @Min(1)
  maxParticipants: number;

  @ApiProperty({ example: 50 })
  @Expose()
  @IsNumber()
  @Min(0)
  entryFee: number;

  @ApiProperty({
    example: 'Single Elimination',
    required: false,
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsString()
  format?: string | null;

  @ApiProperty({
    example: 'Race to 5, standard WPA rules',
    required: false,
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsString()
  rules?: string | null;

  @ApiProperty({
    example: 'Winner gets 70% of the prize pool',
    required: false,
    nullable: true,
  })
  @Expose()
  @IsOptional()
  @IsString()
  prizeDescription?: string | null;
}

export class UpdateTournamentDto extends PartialType(CreateTournamentDto) {}

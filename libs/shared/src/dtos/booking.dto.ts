import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  BilliardTableDto,
  BilliardTableType,
  type BilliardTableId,
} from './billiard-table.dto';
import { UserDto, type UserId } from './user.dto';

export type BookingId = string;

export enum BookingStatus {
  Pending,
  Cancelled,
  Confirmed,
  Rejected,
  Paid,
}

export class BookingDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  @IsUUID()
  id: BookingId;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Expose()
  userId: UserId | null;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @Expose()
  billiardTableId: BilliardTableId | null;

  @ApiProperty({ enum: BookingStatus, enumName: 'BookingStatus' })
  @Expose()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({ example: '2024-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ example: 1200.5 })
  @Expose()
  @IsNumber()
  totalCost: number;

  @ApiProperty({ example: '2026-01-22T10:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: '2026-01-22T10:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

export class BookingFullDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  @IsUUID()
  id: BookingId;

  @ApiProperty({ type: () => UserDto, nullable: true })
  @Expose()
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto | null;

  @ApiProperty({ type: () => BilliardTableDto, nullable: true })
  @Expose()
  @ValidateNested()
  @Type(() => BilliardTableDto)
  billiardTable: BilliardTableDto | null;

  @ApiProperty({ enum: BookingStatus, enumName: 'BookingStatus' })
  @Expose()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({ example: '2026-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: '2026-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ example: 1200.5 })
  @Expose()
  @IsNumber()
  totalCost: number;

  @ApiProperty({ example: '2026-01-22T10:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ example: '2026-01-22T10:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

export class GetBookingsQueryDto {
  @ApiPropertyOptional({ enum: BookingStatus, enumName: 'BookingStatus' })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsOptional()
  @IsUUID()
  userId?: UserId;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsOptional()
  @IsUUID()
  billiardTableId?: BilliardTableId;

  @ApiPropertyOptional({ example: '2026-05-20T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDateFrom?: Date;

  @ApiPropertyOptional({ example: '2026-05-20T23:59:59.999Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDateTo?: Date;

  @ApiPropertyOptional({ example: '2026-05-20T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdFrom?: Date;

  @ApiPropertyOptional({ example: '2026-05-20T23:59:59.999Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdTo?: Date;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minTotalCost?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxTotalCost?: number;
}

export class CreateBookingDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @Expose()
  billiardTableId: BilliardTableId;

  @ApiProperty({ example: '2024-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  endTime: Date;
}

export class CreateBookingContextDto {
  @ApiProperty({ example: 600 })
  @Expose()
  @IsNumber()
  hourlyPrice: number;
}

export class CreateBookingManualDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @Expose()
  billiardTableId: BilliardTableId;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @Expose()
  userId: UserId;

  @ApiProperty({ example: '2024-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  endTime: Date;
}

export class GetAvailableBilliardTablesDto {
  @ApiProperty({ enum: BilliardTableType, enumName: 'BilliardTableType' })
  @Expose()
  @IsEnum(BilliardTableType)
  type: BilliardTableType;

  @ApiProperty({ example: '2024-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  endTime: Date;
}

export class AvailableBilliardTableDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @Expose()
  id: BilliardTableId;

  @ApiProperty({ example: 'Table 1' })
  @Expose()
  title: string;

  @ApiProperty({ enum: BilliardTableType, enumName: 'BilliardTableType' })
  @Expose()
  @IsEnum(BilliardTableType)
  type: BilliardTableType;

  @ApiProperty({ example: 600 })
  @Expose()
  @IsNumber()
  hourlyPrice: number;

  @ApiProperty({ example: 1200 })
  @Expose()
  @IsNumber()
  totalCost: number;
}

export class GetBusyBilliardTableIdsInRangeDto {
  @ApiProperty({ type: 'string', isArray: true })
  @Expose()
  @IsArray()
  @IsUUID('4', { each: true })
  tableIds: BilliardTableId[];

  @ApiProperty({ example: '2024-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  endTime: Date;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, enumName: 'BookingStatus' })
  @Expose()
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

export class GetBookedSlotsDto {
  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  @Type(() => Date)
  date: Date;
}

export class BookedSlotDto {
  @ApiProperty({
    example: '2026-01-21T14:00:00.000Z',
  })
  @Expose()
  @IsDate()
  @Type(() => Date)
  start: Date;

  @ApiProperty({
    example: '2026-01-21T15:00:00.000Z',
  })
  @Expose()
  @IsDate()
  @Type(() => Date)
  end: Date;
}

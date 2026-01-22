import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsUUID } from 'class-validator';

import type { BilliardTableId } from './billiard-table.dto';
import type { UserId } from './user.dto';

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
  startTime: Date;

  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  endTime: Date;

  @ApiProperty({ example: 1200.5 })
  @Expose()
  @IsNumber()
  totalCost: number;
}

export class CreateBookingDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @Expose()
  billiardTableId: BilliardTableId;

  @ApiProperty({ example: '2024-05-20T14:00:00Z' })
  @Expose()
  @IsDate()
  startTime: Date;

  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  endTime: Date;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus, enumName: 'BookingStatus' })
  @Expose()
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

export class GetFreeSlotsDto {
  @ApiProperty({ example: '2024-05-20T16:00:00Z' })
  @Expose()
  @IsDate()
  date: Date;
}

export class FreeSlotDto {
  @ApiProperty({
    example: '2026-01-21T14:00:00.000Z',
  })
  @Expose()
  @IsDate()
  start: Date;

  @ApiProperty({
    example: '2026-01-21T15:00:00.000Z',
  })
  @Expose()
  @IsDate()
  end: Date;
}

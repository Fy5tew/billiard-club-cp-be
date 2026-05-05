import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import type { BilliardTableId } from './billiard-table.dto';

export enum StatisticsChartGroup {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export class StatisticsQueryDto {
  @ApiPropertyOptional({ example: '2026-04-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  @ApiPropertyOptional({ example: '2026-04-30T23:59:59.999Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateTo?: Date;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsOptional()
  @IsUUID()
  tableId?: BilliardTableId;
}

export class StatisticsKpiDto {
  @ApiProperty({ example: 2400 })
  @IsNumber()
  totalRevenue: number;

  @ApiProperty({ example: 32 })
  @IsNumber()
  bookingsCount: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  cancelledBookingsCount: number;

  @ApiProperty({ example: 75 })
  @IsNumber()
  averageBookingValue: number;

  @ApiProperty({ example: 2.25 })
  @IsNumber()
  averagePlayDuration: number;

  @ApiProperty({ example: 2800 })
  @IsNumber()
  potentialRevenue: number;
}

export class StatisticsChartPointDto {
  @ApiProperty({ example: '2026-04-01' })
  @IsString()
  label: string;

  @ApiProperty({ example: 450 })
  @IsNumber()
  value: number;
}

export class StatisticsChartDto {
  @ApiProperty({ enum: StatisticsChartGroup, enumName: 'StatisticsChartGroup' })
  @IsEnum(StatisticsChartGroup)
  groupBy: StatisticsChartGroup;

  @ApiProperty({ type: [StatisticsChartPointDto] })
  @ValidateNested({ each: true })
  @Type(() => StatisticsChartPointDto)
  points: StatisticsChartPointDto[];
}

export class StatisticsPeakHourDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  weekday: number;

  @ApiProperty({ example: 'Mon' })
  @IsString()
  weekdayLabel: string;

  @ApiProperty({ example: 18 })
  @IsNumber()
  hour: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  bookingsCount: number;

  @ApiProperty({ example: 7 })
  @IsNumber()
  occupiedHours: number;
}

export class StatisticsTableUtilizationDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  @IsUUID()
  tableId: BilliardTableId;

  @ApiProperty({ example: 'Pool Table 1' })
  @IsString()
  tableName: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  bookingsCount: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  paidBookingsCount: number;

  @ApiProperty({ example: 960 })
  @IsNumber()
  revenue: number;

  @ApiProperty({ example: 18.5 })
  @IsNumber()
  totalUsageDuration: number;

  @ApiProperty({ example: 22.8 })
  @IsNumber()
  utilizationPercent: number;
}

export class StatisticsDashboardDto {
  @ApiProperty({ type: StatisticsKpiDto })
  @ValidateNested()
  @Type(() => StatisticsKpiDto)
  kpi: StatisticsKpiDto;

  @ApiProperty({ type: StatisticsChartDto })
  @ValidateNested()
  @Type(() => StatisticsChartDto)
  revenueChart: StatisticsChartDto;

  @ApiProperty({ type: StatisticsChartDto })
  @ValidateNested()
  @Type(() => StatisticsChartDto)
  bookingsChart: StatisticsChartDto;

  @ApiProperty({ type: [StatisticsPeakHourDto] })
  @ValidateNested({ each: true })
  @Type(() => StatisticsPeakHourDto)
  peakHours: StatisticsPeakHourDto[];

  @ApiProperty({ type: [StatisticsTableUtilizationDto] })
  @ValidateNested({ each: true })
  @Type(() => StatisticsTableUtilizationDto)
  tableUtilization: StatisticsTableUtilizationDto[];
}

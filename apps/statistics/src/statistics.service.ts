import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { BilliardTableDto } from '@app/shared/dtos/billiard-table.dto';
import { BookingDto } from '@app/shared/dtos/booking.dto';
import {
  StatisticsChartDto,
  StatisticsChartGroup,
  StatisticsDashboardDto,
  StatisticsKpiDto,
  StatisticsPeakHourDto,
  StatisticsQueryDto,
  StatisticsTableUtilizationDto,
} from '@app/shared/dtos/statistics.dto';
import { BilliardTableEntity } from '@app/shared/entities/billiard-table.entity';
import { BookingEntity } from '@app/shared/entities/booking.entity';

import {
  CANCELLED_BOOKING_STATUSES,
  HOUR_MS,
  REVENUE_BOOKING_STATUSES,
  WEEKDAY_LABELS,
} from './statistics.constants';
import type { StatisticsSource } from './statistics.types';
import {
  getStatisticsChartGroup,
  getStatisticsRange,
  roundStatisticsDuration,
  roundStatisticsMoney,
} from './statistics.utils';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
    @InjectRepository(BilliardTableEntity)
    private readonly tables: Repository<BilliardTableEntity>,
  ) {}

  async getDashboard(
    query: StatisticsQueryDto,
  ): Promise<StatisticsDashboardDto> {
    const source = await this.getSource(query);

    return {
      kpi: this.getKpiFromSource(source),
      revenueChart: this.getRevenueChartFromSource(source),
      bookingsChart: this.getBookingsChartFromSource(source),
      peakHours: this.getPeakHoursFromSource(source),
      tableUtilization: this.getTableUtilizationFromSource(source),
    };
  }

  async getKpi(query: StatisticsQueryDto): Promise<StatisticsKpiDto> {
    return this.getKpiFromSource(await this.getSource(query));
  }

  async getRevenueChart(
    query: StatisticsQueryDto,
  ): Promise<StatisticsChartDto> {
    return this.getRevenueChartFromSource(await this.getSource(query));
  }

  async getBookingsChart(
    query: StatisticsQueryDto,
  ): Promise<StatisticsChartDto> {
    return this.getBookingsChartFromSource(await this.getSource(query));
  }

  async getPeakHours(
    query: StatisticsQueryDto,
  ): Promise<StatisticsPeakHourDto[]> {
    return this.getPeakHoursFromSource(await this.getSource(query));
  }

  async getTableUtilization(
    query: StatisticsQueryDto,
  ): Promise<StatisticsTableUtilizationDto[]> {
    return this.getTableUtilizationFromSource(await this.getSource(query));
  }

  private async getSource(
    query: StatisticsQueryDto,
  ): Promise<StatisticsSource> {
    const [bookings, tables] = await Promise.all([
      this.bookings.find(),
      this.tables.find(),
    ]);

    return {
      bookings: bookings.map((booking) =>
        plainToInstance(
          BookingDto,
          { ...booking, totalCost: Number(booking.totalCost) },
          { excludeExtraneousValues: true },
        ),
      ),
      tables: tables.map((table) =>
        plainToInstance(
          BilliardTableDto,
          { ...table, hourlyPrice: Number(table.hourlyPrice), photos: [] },
          { excludeExtraneousValues: true },
        ),
      ),
      query,
    };
  }

  private getKpiFromSource(source: StatisticsSource): StatisticsKpiDto {
    const bookings = this.filterBookings(source);
    const revenueBookings = bookings.filter((booking) =>
      REVENUE_BOOKING_STATUSES.includes(booking.status),
    );
    const nonCancelledBookings = bookings.filter(
      (booking) => !CANCELLED_BOOKING_STATUSES.includes(booking.status),
    );

    return {
      totalRevenue: roundStatisticsMoney(this.sumBookingCost(revenueBookings)),
      bookingsCount: bookings.length,
      cancelledBookingsCount: bookings.filter((booking) =>
        CANCELLED_BOOKING_STATUSES.includes(booking.status),
      ).length,
      averageBookingValue: roundStatisticsMoney(
        this.average(
          revenueBookings.map((booking) => this.getBookingCost(booking)),
        ),
      ),
      averagePlayDuration: roundStatisticsDuration(
        this.average(
          bookings.map((booking) => this.getBookingDuration(booking)),
        ),
      ),
      potentialRevenue: roundStatisticsMoney(
        nonCancelledBookings.reduce(
          (sum, booking) =>
            sum + this.getBookingPotentialRevenue(booking, source.tables),
          0,
        ),
      ),
    };
  }

  private getRevenueChartFromSource(
    source: StatisticsSource,
  ): StatisticsChartDto {
    const groupBy = getStatisticsChartGroup(source.query);
    const points = this.createGroupedPoints(source.query, groupBy);
    const buckets = new Map(points.map((point) => [point.label, point.value]));

    this.filterBookings(source)
      .filter((booking) => REVENUE_BOOKING_STATUSES.includes(booking.status))
      .forEach((booking) => {
        const label = this.getBucketLabel(new Date(booking.startTime), groupBy);
        buckets.set(
          label,
          (buckets.get(label) ?? 0) + this.getBookingCost(booking),
        );
      });

    return {
      groupBy,
      points: points.map(({ label }) => ({
        label,
        value: roundStatisticsMoney(buckets.get(label) ?? 0),
      })),
    };
  }

  private getBookingsChartFromSource(
    source: StatisticsSource,
  ): StatisticsChartDto {
    const groupBy = getStatisticsChartGroup(source.query);
    const points = this.createGroupedPoints(source.query, groupBy);
    const buckets = new Map(points.map((point) => [point.label, point.value]));

    this.filterBookings(source).forEach((booking) => {
      const label = this.getBucketLabel(new Date(booking.startTime), groupBy);
      buckets.set(label, (buckets.get(label) ?? 0) + 1);
    });

    return {
      groupBy,
      points: points.map(({ label }) => ({
        label,
        value: buckets.get(label) ?? 0,
      })),
    };
  }

  private getPeakHoursFromSource(
    source: StatisticsSource,
  ): StatisticsPeakHourDto[] {
    const cells = new Map<string, StatisticsPeakHourDto>();

    for (let weekday = 0; weekday < WEEKDAY_LABELS.length; weekday += 1) {
      for (let hour = 0; hour < 24; hour += 1) {
        cells.set(this.getPeakHourKey(weekday, hour), {
          weekday,
          weekdayLabel: WEEKDAY_LABELS[weekday],
          hour,
          bookingsCount: 0,
          occupiedHours: 0,
        });
      }
    }

    this.filterBookings(source)
      .filter((booking) => !CANCELLED_BOOKING_STATUSES.includes(booking.status))
      .forEach((booking) => this.addBookingToPeakHours(booking, cells));

    return [...cells.values()];
  }

  private getTableUtilizationFromSource(
    source: StatisticsSource,
  ): StatisticsTableUtilizationDto[] {
    const range = getStatisticsRange(source.query);
    const totalRangeHours = Math.max(
      1,
      (range.dateTo.getTime() - range.dateFrom.getTime()) / HOUR_MS,
    );
    const bookings = this.filterBookings(source);

    return source.tables
      .filter(
        (table) => !source.query.tableId || table.id === source.query.tableId,
      )
      .map((table) => {
        const tableBookings = bookings.filter(
          (booking) => booking.billiardTableId === table.id,
        );
        const paidBookings = tableBookings.filter((booking) =>
          REVENUE_BOOKING_STATUSES.includes(booking.status),
        );
        const usageBookings = tableBookings.filter(
          (booking) => !CANCELLED_BOOKING_STATUSES.includes(booking.status),
        );
        const totalUsageDuration = this.sumDuration(usageBookings);

        return {
          tableId: table.id,
          tableName: table.title,
          bookingsCount: tableBookings.length,
          paidBookingsCount: paidBookings.length,
          revenue: roundStatisticsMoney(this.sumBookingCost(paidBookings)),
          totalUsageDuration: roundStatisticsDuration(totalUsageDuration),
          utilizationPercent: roundStatisticsDuration(
            (totalUsageDuration / totalRangeHours) * 100,
          ),
        };
      })
      .sort((left, right) => right.revenue - left.revenue);
  }

  private filterBookings(source: StatisticsSource): BookingDto[] {
    const { dateFrom, dateTo } = getStatisticsRange(source.query);

    return source.bookings.filter((booking) => {
      const startTime = new Date(booking.startTime);

      return (
        startTime >= dateFrom &&
        startTime <= dateTo &&
        (!source.query.tableId ||
          booking.billiardTableId === source.query.tableId)
      );
    });
  }

  private addBookingToPeakHours(
    booking: BookingDto,
    cells: Map<string, StatisticsPeakHourDto>,
  ): void {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    let cursor = new Date(start);
    cursor.setMinutes(0, 0, 0);

    while (cursor < end) {
      const nextHour = new Date(cursor.getTime() + HOUR_MS);
      const overlapStart = Math.max(start.getTime(), cursor.getTime());
      const overlapEnd = Math.min(end.getTime(), nextHour.getTime());
      const occupiedHours = Math.max(0, (overlapEnd - overlapStart) / HOUR_MS);

      if (occupiedHours > 0) {
        const key = this.getPeakHourKey(cursor.getDay(), cursor.getHours());
        const cell = cells.get(key);
        if (cell) {
          cell.bookingsCount += 1;
          cell.occupiedHours = roundStatisticsDuration(
            cell.occupiedHours + occupiedHours,
          );
        }
      }

      cursor = nextHour;
    }
  }

  private createGroupedPoints(
    query: StatisticsQueryDto,
    groupBy: StatisticsChartGroup,
  ): { label: string; value: number }[] {
    const { dateFrom, dateTo } = getStatisticsRange(query);
    const points: { label: string; value: number }[] = [];
    const cursor = this.getBucketStart(dateFrom, groupBy);

    while (cursor <= dateTo) {
      points.push({ label: this.getBucketLabel(cursor, groupBy), value: 0 });
      this.advanceBucket(cursor, groupBy);
    }

    return points;
  }

  private getBucketStart(date: Date, groupBy: StatisticsChartGroup): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);

    if (groupBy === StatisticsChartGroup.Week) {
      result.setDate(result.getDate() - result.getDay());
    }

    if (groupBy === StatisticsChartGroup.Month) {
      result.setDate(1);
    }

    return result;
  }

  private advanceBucket(date: Date, groupBy: StatisticsChartGroup): void {
    if (groupBy === StatisticsChartGroup.Day) date.setDate(date.getDate() + 1);
    if (groupBy === StatisticsChartGroup.Week) date.setDate(date.getDate() + 7);
    if (groupBy === StatisticsChartGroup.Month) {
      date.setMonth(date.getMonth() + 1);
    }
  }

  private getBucketLabel(date: Date, groupBy: StatisticsChartGroup): string {
    const start = this.getBucketStart(date, groupBy);
    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, '0');
    const day = String(start.getDate()).padStart(2, '0');

    if (groupBy === StatisticsChartGroup.Month) return `${year}-${month}`;
    return `${year}-${month}-${day}`;
  }

  private getBookingDuration(booking: BookingDto): number {
    return (
      (new Date(booking.endTime).getTime() -
        new Date(booking.startTime).getTime()) /
      HOUR_MS
    );
  }

  private getBookingCost(booking: BookingDto): number {
    return Number(booking.totalCost) || 0;
  }

  private getBookingPotentialRevenue(
    booking: BookingDto,
    tables: BilliardTableDto[],
  ): number {
    const explicitCost = this.getBookingCost(booking);
    if (explicitCost > 0) return explicitCost;

    const table = tables.find(({ id }) => id === booking.billiardTableId);
    return this.getBookingDuration(booking) * Number(table?.hourlyPrice ?? 0);
  }

  private sumBookingCost(bookings: BookingDto[]): number {
    return bookings.reduce(
      (sum, booking) => sum + this.getBookingCost(booking),
      0,
    );
  }

  private sumDuration(bookings: BookingDto[]): number {
    return bookings.reduce(
      (sum, booking) => sum + this.getBookingDuration(booking),
      0,
    );
  }

  private average(values: number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private getPeakHourKey(weekday: number, hour: number): string {
    return `${weekday}:${hour}`;
  }
}

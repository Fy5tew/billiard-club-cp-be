import { BilliardTableDto } from '@app/shared/dtos/billiard-table.dto';
import { BookingDto } from '@app/shared/dtos/booking.dto';
import { StatisticsQueryDto } from '@app/shared/dtos/statistics.dto';

export type StatisticsSource = {
  bookings: BookingDto[];
  tables: BilliardTableDto[];
  query: StatisticsQueryDto;
};

export type NormalizedRange = {
  dateFrom: Date;
  dateTo: Date;
};

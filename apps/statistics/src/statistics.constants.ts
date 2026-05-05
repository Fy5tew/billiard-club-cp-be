import { BookingStatus } from '@app/shared/dtos/booking.dto';

export const HOUR_MS = 1000 * 60 * 60;
export const DAY_MS = HOUR_MS * 24;
export const DAILY_CHART_MAX_DAYS = 31;
export const WEEKLY_CHART_MAX_DAYS = 90;

export const WEEKDAY_LABELS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

export const REVENUE_BOOKING_STATUSES = [BookingStatus.Paid];

export const CANCELLED_BOOKING_STATUSES = [
  BookingStatus.Cancelled,
  BookingStatus.Rejected,
];

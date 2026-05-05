import {
  StatisticsChartGroup,
  StatisticsQueryDto,
} from '@app/shared/dtos/statistics.dto';

import {
  DAILY_CHART_MAX_DAYS,
  DAY_MS,
  WEEKLY_CHART_MAX_DAYS,
} from './statistics.constants';
import type { NormalizedRange } from './statistics.types';

export const getStatisticsRange = ({
  dateFrom,
  dateTo,
}: StatisticsQueryDto): NormalizedRange => {
  const now = new Date();
  const fallbackTo = new Date(now);
  const fallbackFrom = new Date(now);
  fallbackFrom.setDate(fallbackFrom.getDate() - 30);
  fallbackFrom.setHours(0, 0, 0, 0);
  fallbackTo.setHours(23, 59, 59, 999);

  return {
    dateFrom: dateFrom ? new Date(dateFrom) : fallbackFrom,
    dateTo: dateTo ? new Date(dateTo) : fallbackTo,
  };
};

export const getStatisticsChartGroup = (
  query: StatisticsQueryDto,
): StatisticsChartGroup => {
  const { dateFrom, dateTo } = getStatisticsRange(query);
  const days = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / DAY_MS);

  if (days <= DAILY_CHART_MAX_DAYS) return StatisticsChartGroup.Day;
  if (days <= WEEKLY_CHART_MAX_DAYS) return StatisticsChartGroup.Week;
  return StatisticsChartGroup.Month;
};

export const roundStatisticsMoney = (value: number): number =>
  Math.round(value * 100) / 100;

export const roundStatisticsDuration = (value: number): number =>
  Math.round(value * 100) / 100;

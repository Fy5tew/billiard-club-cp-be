import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  StatisticsChartDto,
  StatisticsDashboardDto,
  StatisticsKpiDto,
  StatisticsPeakHourDto,
  StatisticsQueryDto,
  StatisticsTableUtilizationDto,
} from '@app/shared/dtos/statistics.dto';
import { StatisticsMessage } from '@app/shared/services/statistics/statistics.messages';

import { StatisticsService } from './statistics.service';

@Controller()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @MessagePattern(StatisticsMessage.GET_DASHBOARD)
  async getDashboard(
    @Payload() query: StatisticsQueryDto,
  ): Promise<StatisticsDashboardDto> {
    return this.statisticsService.getDashboard(query);
  }

  @MessagePattern(StatisticsMessage.GET_KPI)
  async getKpi(
    @Payload() query: StatisticsQueryDto,
  ): Promise<StatisticsKpiDto> {
    return this.statisticsService.getKpi(query);
  }

  @MessagePattern(StatisticsMessage.GET_REVENUE_CHART)
  async getRevenueChart(
    @Payload() query: StatisticsQueryDto,
  ): Promise<StatisticsChartDto> {
    return this.statisticsService.getRevenueChart(query);
  }

  @MessagePattern(StatisticsMessage.GET_BOOKINGS_CHART)
  async getBookingsChart(
    @Payload() query: StatisticsQueryDto,
  ): Promise<StatisticsChartDto> {
    return this.statisticsService.getBookingsChart(query);
  }

  @MessagePattern(StatisticsMessage.GET_PEAK_HOURS)
  async getPeakHours(
    @Payload() query: StatisticsQueryDto,
  ): Promise<StatisticsPeakHourDto[]> {
    return this.statisticsService.getPeakHours(query);
  }

  @MessagePattern(StatisticsMessage.GET_TABLE_UTILIZATION)
  async getTableUtilization(
    @Payload() query: StatisticsQueryDto,
  ): Promise<StatisticsTableUtilizationDto[]> {
    return this.statisticsService.getTableUtilization(query);
  }
}

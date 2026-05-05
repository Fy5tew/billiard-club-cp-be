import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { StatisticsMessage } from './statistics.messages';
import {
  StatisticsChartDto,
  StatisticsDashboardDto,
  StatisticsKpiDto,
  StatisticsPeakHourDto,
  StatisticsQueryDto,
  StatisticsTableUtilizationDto,
} from '../../dtos/statistics.dto';
import { Service } from '../services.types';

@Injectable()
export class StatisticsClient {
  constructor(
    @Inject(Service.STATISTICS) private readonly client: ClientProxy,
  ) {}

  async getDashboard(
    query: StatisticsQueryDto,
  ): Promise<StatisticsDashboardDto> {
    return firstValueFrom(
      this.client.send<StatisticsDashboardDto, StatisticsQueryDto>(
        StatisticsMessage.GET_DASHBOARD,
        query,
      ),
    );
  }

  async getKpi(query: StatisticsQueryDto): Promise<StatisticsKpiDto> {
    return firstValueFrom(
      this.client.send<StatisticsKpiDto, StatisticsQueryDto>(
        StatisticsMessage.GET_KPI,
        query,
      ),
    );
  }

  async getRevenueChart(
    query: StatisticsQueryDto,
  ): Promise<StatisticsChartDto> {
    return firstValueFrom(
      this.client.send<StatisticsChartDto, StatisticsQueryDto>(
        StatisticsMessage.GET_REVENUE_CHART,
        query,
      ),
    );
  }

  async getBookingsChart(
    query: StatisticsQueryDto,
  ): Promise<StatisticsChartDto> {
    return firstValueFrom(
      this.client.send<StatisticsChartDto, StatisticsQueryDto>(
        StatisticsMessage.GET_BOOKINGS_CHART,
        query,
      ),
    );
  }

  async getPeakHours(
    query: StatisticsQueryDto,
  ): Promise<StatisticsPeakHourDto[]> {
    return firstValueFrom(
      this.client.send<StatisticsPeakHourDto[], StatisticsQueryDto>(
        StatisticsMessage.GET_PEAK_HOURS,
        query,
      ),
    );
  }

  async getTableUtilization(
    query: StatisticsQueryDto,
  ): Promise<StatisticsTableUtilizationDto[]> {
    return firstValueFrom(
      this.client.send<StatisticsTableUtilizationDto[], StatisticsQueryDto>(
        StatisticsMessage.GET_TABLE_UTILIZATION,
        query,
      ),
    );
  }
}

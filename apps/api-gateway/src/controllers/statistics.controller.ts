import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  StatisticsChartDto,
  StatisticsDashboardDto,
  StatisticsKpiDto,
  StatisticsPeakHourDto,
  StatisticsQueryDto,
  StatisticsTableUtilizationDto,
} from '@app/shared/dtos/statistics.dto';
import { UserRole } from '@app/shared/dtos/user.dto';
import { StatisticsClient } from '@app/shared/services/statistics/statistics.client';

import { RoleAccess } from '../auth/auth.decorators';
import { StatisticsRoute } from '../constants/statistics.constants';

@ApiTags('Statistics')
@ApiBearerAuth()
@RoleAccess(UserRole.Admin)
@Controller(StatisticsRoute.BASE)
export class StatisticsController {
  constructor(private readonly statisticsClient: StatisticsClient) {}

  @ApiOperation({ summary: 'Get aggregate statistics dashboard' })
  @ApiResponse({ status: HttpStatus.OK, type: StatisticsDashboardDto })
  @Get(StatisticsRoute.DASHBOARD)
  async getDashboard(
    @Query() query: StatisticsQueryDto,
  ): Promise<StatisticsDashboardDto> {
    return this.statisticsClient.getDashboard(query);
  }

  @ApiOperation({ summary: 'Get statistics KPI metrics' })
  @ApiResponse({ status: HttpStatus.OK, type: StatisticsKpiDto })
  @Get(StatisticsRoute.KPI)
  async getKpi(@Query() query: StatisticsQueryDto): Promise<StatisticsKpiDto> {
    return this.statisticsClient.getKpi(query);
  }

  @ApiOperation({ summary: 'Get revenue chart' })
  @ApiResponse({ status: HttpStatus.OK, type: StatisticsChartDto })
  @Get(StatisticsRoute.REVENUE_CHART)
  async getRevenueChart(
    @Query() query: StatisticsQueryDto,
  ): Promise<StatisticsChartDto> {
    return this.statisticsClient.getRevenueChart(query);
  }

  @ApiOperation({ summary: 'Get booking volume chart' })
  @ApiResponse({ status: HttpStatus.OK, type: StatisticsChartDto })
  @Get(StatisticsRoute.BOOKINGS_CHART)
  async getBookingsChart(
    @Query() query: StatisticsQueryDto,
  ): Promise<StatisticsChartDto> {
    return this.statisticsClient.getBookingsChart(query);
  }

  @ApiOperation({ summary: 'Get peak-hour occupancy analytics' })
  @ApiResponse({ status: HttpStatus.OK, type: [StatisticsPeakHourDto] })
  @Get(StatisticsRoute.PEAK_HOURS)
  async getPeakHours(
    @Query() query: StatisticsQueryDto,
  ): Promise<StatisticsPeakHourDto[]> {
    return this.statisticsClient.getPeakHours(query);
  }

  @ApiOperation({ summary: 'Get table utilization analytics' })
  @ApiResponse({ status: HttpStatus.OK, type: [StatisticsTableUtilizationDto] })
  @Get(StatisticsRoute.TABLE_UTILIZATION)
  async getTableUtilization(
    @Query() query: StatisticsQueryDto,
  ): Promise<StatisticsTableUtilizationDto[]> {
    return this.statisticsClient.getTableUtilization(query);
  }
}

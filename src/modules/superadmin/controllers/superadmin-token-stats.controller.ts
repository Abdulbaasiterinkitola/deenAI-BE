import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SuperadminTokenStatsService } from '../services/superadmin-token-stats.service';
import { SuperadminGuard } from '@guards/superadmin.guard';
import { TokenStatsDocs } from '../docs/token-stats.doc';
import {
  OverviewDto,
  TimeSeriesDto,
  TopUserDto,
  BreakdownDto,
  PlanStatsDto,
  UserDetailDto,
} from '../dtos/token-stats.dto';

@ApiTags('Superadmin AI Stats')
@ApiBearerAuth()
@UseGuards(SuperadminGuard)
@Controller('superadmin/stats/tokens')
export class SuperadminTokenStatsController {
  constructor(private readonly svc: SuperadminTokenStatsService) {}

  @Get('overview')
  @TokenStatsDocs.overview()
  async getOverview(): Promise<OverviewDto> {
    return this.svc.getOverview();
  }

  @Get('usage')
  @TokenStatsDocs.usage()
  async getUsageTrend(
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TimeSeriesDto> {
    return this.svc.getUsageTrend({ period, startDate, endDate });
  }

  @Get('users')
  @TokenStatsDocs.topUsers()
  async getTopUsers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('period') period: 'all' | '7d' | '30d' = 'all',
  ): Promise<TopUserDto[]> {
    return this.svc.getTopUsers({ limit, period });
  }

  @Get('breakdown')
  @TokenStatsDocs.breakdown()
  async getBreakdown(): Promise<BreakdownDto> {
    return this.svc.getBreakdown();
  }

  @Get('plans')
  @TokenStatsDocs.plans()
  async getByPlan(): Promise<PlanStatsDto[]> {
    return this.svc.getByPlan();
  }

  @Get('user/:userId')
  @TokenStatsDocs.userDetail()
  async getUserDetail(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ): Promise<UserDetailDto> {
    return this.svc.getUserDetail({ userId, page, limit });
  }

  @Get('time-series')
  @TokenStatsDocs.timeSeries()
  @ApiQuery({ name: 'granularity', required: false, example: 'day' })
  async getTimeSeries(
    @Query('granularity') granularity: 'hour' | 'day' | 'week' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TimeSeriesDto> {
    return this.svc.getTimeSeries({ granularity, startDate, endDate });
  }
}

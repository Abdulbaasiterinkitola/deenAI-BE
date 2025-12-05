import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SuperadminStatsService } from '../services/superadmin-stats.service';
import { SuperadminGuard } from '../../../guards/superadmin.guard';
import {
  StatsOverviewDto,
  UserGrowthDto,
  UserEngagementDto,
} from '../dtos/stats-overview.dto';
import { SuperadminStatsDocs } from '../docs/stats.doc';

@ApiTags('Superadmin Stats')
@ApiBearerAuth()
@Controller('superadmin/stats')
@UseGuards(SuperadminGuard)
export class SuperadminStatsController {
  constructor(
    private readonly superadminStatsService: SuperadminStatsService,
  ) {}

  @Get('overview')
  @SuperadminStatsDocs.getOverview()
  async getOverview(): Promise<{ message: string; data: StatsOverviewDto }> {
    return this.superadminStatsService.getOverviewStats();
  }

  @Get('users/growth')
  @SuperadminStatsDocs.getUserGrowth()
  async getUserGrowth(
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ message: string; data: UserGrowthDto }> {
    return this.superadminStatsService.getUserGrowth({
      period,
      startDate,
      endDate,
    });
  }

  @Get('users/engagement')
  @SuperadminStatsDocs.getUserEngagement()
  async getUserEngagement(): Promise<{
    message: string;
    data: UserEngagementDto;
  }> {
    return this.superadminStatsService.getUserEngagement();
  }
}

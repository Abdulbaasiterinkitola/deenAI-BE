import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SuperadminStatsService } from '../services/superadmin-stats.service';
import { SuperadminGuard } from '../../../guards/superadmin.guard';
import { StatsOverviewDto } from '../dtos/stats-overview.dto';
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
}


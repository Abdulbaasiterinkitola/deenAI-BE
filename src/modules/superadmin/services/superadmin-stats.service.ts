import { Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { StatsOverviewDto } from '../dtos/stats-overview.dto';

@Injectable()
export class SuperadminStatsService {
  constructor(private readonly usersService: UsersService) {}

  async getOverviewStats(): Promise<{ message: string; data: StatsOverviewDto }> {
    const stats = await this.usersService.getOverviewStats();

    return {
      message: 'Platform overview statistics retrieved successfully',
      data: {
        totalUsers: stats.totalUsers,
        activeUsers: stats.activeUsers,
        pausedUsers: stats.pausedUsers,
        newUsersLast7Days: stats.newUsersLast7Days,
        newUsersLast30Days: stats.newUsersLast30Days,
        statusBreakdown: stats.statusBreakdown,
      },
    };
  }
}


import { Injectable } from '@nestjs/common';
import { UserModelAction } from '../action-models/user.action-model';
import { UserStatus } from '../enums/user-status.enum';

export interface UserStatsOverview {
  totalUsers: number;
  activeUsers: number;
  pausedUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  statusBreakdown: {
    active: number;
    paused: number;
  };
}

@Injectable()
export class UserStatsService {
  constructor(private readonly userModelAction: UserModelAction) {}

  async getOverviewStats(): Promise<UserStatsOverview> {
    // Calculate date thresholds
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all counts in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      pausedUsers,
      newUsersLast7Days,
      newUsersLast30Days,
    ] = await Promise.all([
      this.userModelAction.getTotalCount(),
      this.userModelAction.getCountByStatus(UserStatus.ACTIVE),
      this.userModelAction.getCountByStatus(UserStatus.PAUSED),
      this.userModelAction.getCountByCreatedAtRange(sevenDaysAgo),
      this.userModelAction.getCountByCreatedAtRange(thirtyDaysAgo),
    ]);

    return {
      totalUsers,
      activeUsers,
      pausedUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      statusBreakdown: {
        active: activeUsers,
        paused: pausedUsers,
      },
    };
  }
}

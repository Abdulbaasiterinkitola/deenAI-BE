import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersService } from '@modules/users/users.service';
import {
  StatsOverviewDto,
  UserGrowthDto,
  UserGrowthPoint,
  UserEngagementDto,
} from '../dtos/stats-overview.dto';
import { CustomHttpException } from '@shared/custom.exception';

@Injectable()
export class SuperadminStatsService {
  private readonly logger = new Logger(SuperadminStatsService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async getOverviewStats(): Promise<{
    message: string;
    data: StatsOverviewDto;
  }> {
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

  private parseDateOrNull(s?: string): Date | null {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  async getUserGrowth(opts: {
    period: 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    message: string;
    data: UserGrowthDto;
  }> {
    const { period, startDate, endDate } = opts;

    // Default date ranges based on period
    let defaultDays = 30;
    if (period === 'month') {
      defaultDays = 365; // 1 year for monthly view
    } else if (period === 'week') {
      defaultDays = 90; // ~3 months for weekly view
    }

    // Parse dates or use defaults
    const start =
      this.parseDateOrNull(startDate) ||
      new Date(Date.now() - 1000 * 60 * 60 * 24 * defaultDays);
    const end = this.parseDateOrNull(endDate) || new Date();

    // Ensure end date includes the full day (end of day)
    if (!endDate) {
      end.setHours(23, 59, 59, 999);
    }

    if (start > end) {
      throw new CustomHttpException('Invalid date range', 400);
    }

    try {
      // Determine the truncation function based on period
      const trunc =
        period === 'month'
          ? `date_trunc('month', created_at)`
          : period === 'week'
            ? `date_trunc('week', created_at)`
            : `date_trunc('day', created_at)`;

      // Query to get user registrations grouped by period
      // Use >= and <= to ensure we include the full date range
      let rows: Array<{
        bucket: string;
        count: string;
      }> = await this.dataSource.query(
        `
        SELECT ${trunc} as bucket,
          COUNT(*)::bigint AS count
        FROM users
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY bucket
        ORDER BY bucket ASC
        `,
        [start.toISOString(), end.toISOString()],
      );

      // Track if we're using a fallback query (all users)
      let usingFallback = false;

      // If no dates were provided and we got empty results, query all users
      if (rows.length === 0 && !startDate && !endDate) {
        this.logger.log(
          `No users found in default date range (${start.toISOString()} to ${end.toISOString()}), querying all users for period: ${period}`,
        );
        rows = await this.dataSource.query(
          `
          SELECT ${trunc} as bucket,
            COUNT(*)::bigint AS count
          FROM users
          GROUP BY bucket
          ORDER BY bucket ASC
          `,
        );
        usingFallback = true;
      }

      // Get cumulative count up to each period
      const points: UserGrowthPoint[] = [];
      let cumulative = 0;

      // First, get the total count before the start date for cumulative calculation
      // Only calculate if we're not using the fallback (all users query)
      if (!usingFallback) {
        const beforeStartRow = await this.dataSource.query(
          `SELECT COUNT(*)::bigint AS count FROM users WHERE created_at < $1`,
          [start.toISOString()],
        );
        cumulative = Number(beforeStartRow?.[0]?.count || 0);
      }

      // Process each period
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const count = Number(row.count || 0);
        cumulative += count;

        // Calculate growth rate compared to previous period
        // Formula: ((Current - Previous) / Previous) * 100
        // Examples:
        // - Previous: 2, Current: 2 → ((2-2)/2)*100 = 0% (no change)
        // - Previous: 2, Current: 4 → ((4-2)/2)*100 = 100% (doubled)
        // - Previous: 4, Current: 2 → ((2-4)/4)*100 = -50% (halved)
        let growthRate: number | null = null;
        if (i > 0) {
          const previousCount = Number(rows[i - 1].count || 0);
          if (previousCount > 0) {
            growthRate = ((count - previousCount) / previousCount) * 100;
          } else if (count > 0) {
            // Previous period had 0 users, current has users = infinite growth
            // Represented as 100% for practical purposes
            growthRate = 100;
          }
          // If both previous and current are 0, growthRate remains null
        }
        // First period has no previous period to compare, so growthRate is null

        points.push({
          timestamp: new Date(row.bucket).toISOString(),
          count,
          cumulative,
          growthRate:
            growthRate !== null ? Number(growthRate.toFixed(2)) : null,
        });
      }

      return {
        message: 'User growth statistics retrieved successfully',
        data: {
          period,
          points,
        },
      };
    } catch (err) {
      this.logger.error('User growth aggregation failed', err);
      throw new CustomHttpException('Failed to compute user growth', 500);
    }
  }

  async getUserEngagement(): Promise<{
    message: string;
    data: UserEngagementDto;
  }> {
    try {
      const [
        usersWithStreaksRow,
        averageStreakRow,
        averageHighestStreakRow,
        usersWithReflectionsRow,
        usersWithBookmarksRow,
        usersWithChatsRow,
        totalReflectionsRow,
        totalBookmarksRow,
        totalChatsRow,
      ] = await Promise.all([
        this.dataSource.query(
          `SELECT COUNT(DISTINCT user_id)::bigint AS count 
           FROM streaks 
           WHERE current_streak > 0`,
        ),
        this.dataSource.query(
          `SELECT COALESCE(AVG(current_streak), 0) AS avg 
           FROM streaks 
           WHERE current_streak > 0`,
        ),
        // Average highest streak across all users
        this.dataSource.query(
          `SELECT COALESCE(AVG(highest_streak), 0) AS avg 
           FROM streaks`,
        ),
        // Users with reflections
        this.dataSource.query(
          `SELECT COUNT(DISTINCT user_id)::bigint AS count 
           FROM reflections`,
        ),
        // Users with bookmarks
        this.dataSource.query(
          `SELECT COUNT(DISTINCT user_id)::bigint AS count 
           FROM bookmarks`,
        ),
        // Users with chats
        this.dataSource.query(
          `SELECT COUNT(DISTINCT user_id)::bigint AS count 
           FROM chats`,
        ),
        // Total reflections
        this.dataSource.query(
          `SELECT COUNT(*)::bigint AS count FROM reflections`,
        ),
        // Total bookmarks
        this.dataSource.query(
          `SELECT COUNT(*)::bigint AS count FROM bookmarks`,
        ),
        // Total chats
        this.dataSource.query(`SELECT COUNT(*)::bigint AS count FROM chats`),
      ]);

      const result: UserEngagementDto = {
        usersWithStreaks: Number(usersWithStreaksRow?.[0]?.count || 0),
        averageStreakLength: Number(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          parseFloat(averageStreakRow?.[0]?.avg || '0').toFixed(2),
        ),
        averageHighestStreak: Number(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          parseFloat(averageHighestStreakRow?.[0]?.avg || '0').toFixed(2),
        ),
        usersWithReflections: Number(usersWithReflectionsRow?.[0]?.count || 0),
        usersWithBookmarks: Number(usersWithBookmarksRow?.[0]?.count || 0),
        usersWithChats: Number(usersWithChatsRow?.[0]?.count || 0),
        totalReflections: Number(totalReflectionsRow?.[0]?.count || 0),
        totalBookmarks: Number(totalBookmarksRow?.[0]?.count || 0),
        totalChats: Number(totalChatsRow?.[0]?.count || 0),
      };

      return {
        message: 'User engagement statistics retrieved successfully',
        data: result,
      };
    } catch (err) {
      this.logger.error('User engagement aggregation failed', err);
      throw new CustomHttpException('Failed to compute user engagement', 500);
    }
  }
}
